<?php
/**
 * Public REST endpoints, namespace snc/v1 (Plan B5).
 * Works with any permalink setting via ?rest_route=/snc/v1/…
 */

if (!defined('ABSPATH')) {
    exit;
}

const SNC_REST_NS = 'snc/v1';

add_action('rest_api_init', function () {
    $public = '__return_true';
    $slug_arg = ['slug' => ['sanitize_callback' => 'sanitize_title']];

    $routes = [
        '/settings'                   => 'snc_rest_settings',
        '/home'                       => 'snc_rest_home',
        '/page'                       => 'snc_rest_page',
        '/notices'                    => 'snc_rest_notices',
        '/merit-lists'                => 'snc_rest_merit_lists',
        '/documents'                  => 'snc_rest_documents',
        '/programmes'                 => 'snc_rest_programmes',
        '/programmes/(?P<slug>[a-z0-9-]+)' => 'snc_rest_programme',
        '/faculty'                    => 'snc_rest_faculty',
        '/committees'                 => 'snc_rest_committees',
        '/leaders'                    => 'snc_rest_leaders',
        '/gallery'                    => 'snc_rest_gallery',
        '/gallery/(?P<slug>[a-z0-9-]+)' => 'snc_rest_album',
        '/news'                       => 'snc_rest_news',
        '/news/(?P<slug>[a-z0-9-]+)'  => 'snc_rest_news_item',
        '/paths'                      => 'snc_rest_paths',
    ];

    foreach ($routes as $route => $callback) {
        register_rest_route(SNC_REST_NS, $route, [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => $callback,
            'permission_callback' => $public,
            'args'                => str_contains($route, '(?P<slug>') ? $slug_arg : [],
        ]);
    }
});

/** Short public cache on every snc/v1 GET response. */
add_filter('rest_post_dispatch', function ($response, $server, $request) {
    if ($request->get_method() === 'GET' && str_starts_with($request->get_route(), '/' . SNC_REST_NS . '/') && $response instanceof WP_REST_Response) {
        $response->header('Cache-Control', 'public, max-age=60');
    }
    return $response;
}, 10, 3);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function snc_not_found(string $what = 'Item'): WP_Error {
    return new WP_Error('snc_not_found', "$what not found.", ['status' => 404]);
}

/** Run a WP_Query and map posts. */
function snc_query(array $args, callable $map): array {
    $q = new WP_Query(array_merge(['post_status' => 'publish', 'no_found_rows' => true, 'ignore_sticky_posts' => true], $args));
    return array_values(array_filter(array_map($map, $q->posts)));
}

/** Run a paged WP_Query → Paged<T>. */
function snc_paged(array $args, callable $map, WP_REST_Request $req, int $default_per_page = 20): array {
    $page = max(1, (int) $req->get_param('page'));
    $per_page = (int) $req->get_param('per_page');
    $per_page = $per_page > 0 ? min($per_page, 50) : $default_per_page;
    $q = new WP_Query(array_merge(['post_status' => 'publish', 'posts_per_page' => $per_page, 'paged' => $page, 'ignore_sticky_posts' => true], $args));
    return [
        'items'       => array_values(array_map($map, $q->posts)),
        'page'        => $page,
        'total_pages' => (int) $q->max_num_pages,
        'total'       => (int) $q->found_posts,
    ];
}

function snc_tax_clause(string $taxonomy, ?string $slug): ?array {
    $slug = $slug !== null ? sanitize_title($slug) : '';
    return $slug !== '' ? ['taxonomy' => $taxonomy, 'field' => 'slug', 'terms' => $slug] : null;
}

function snc_tax_query(array $clauses): array {
    $clauses = array_values(array_filter($clauses));
    return $clauses ? ['tax_query' => array_merge(['relation' => 'AND'], $clauses)] : [];
}

/** Requested session, or the latest session that has items of this post type. */
function snc_resolve_year(WP_REST_Request $req, string $post_type): string {
    $year = sanitize_title((string) $req->get_param('year'));
    if ($year !== '') {
        return $year;
    }
    foreach (snc_years_for_type($post_type) as $term) {
        return $term['slug'];
    }
    return '';
}

/** Sessions (desc) that have at least one published item of this post type. */
function snc_years_for_type(string $post_type): array {
    global $wpdb;
    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT DISTINCT t.slug, t.name FROM {$wpdb->terms} t
         INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id AND tt.taxonomy = 'academic_year'
         INNER JOIN {$wpdb->term_relationships} tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
         INNER JOIN {$wpdb->posts} p ON p.ID = tr.object_id AND p.post_type = %s AND p.post_status = 'publish'
         ORDER BY t.name DESC",
        $post_type
    ));
    return array_map(fn($r) => ['slug' => $r->slug, 'name' => $r->name], $rows ?: []);
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

function snc_rest_settings() {
    return snc_serialize_settings();
}

function snc_rest_home() {
    $slides = snc_query(['post_type' => 'hero_slide', 'posts_per_page' => 5, 'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC']], 'snc_serialize_slide');

    $gallery = [];
    $albums = get_posts(['post_type' => 'gallery', 'post_status' => 'publish', 'posts_per_page' => 5]);
    foreach ($albums as $album) {
        foreach (snc_album_photo_ids($album->ID) as $id) {
            if (count($gallery) >= 5) {
                break 2;
            }
            if ($img = snc_gallery_img($id)) {
                $gallery[] = $img;
            }
        }
    }

    return [
        'slides'       => $slides,
        'notices'      => snc_query(['post_type' => 'circulars', 'posts_per_page' => 6], 'snc_serialize_notice'),
        'programmes'   => snc_query(['post_type' => 'programs', 'posts_per_page' => 12, 'orderby' => ['menu_order' => 'ASC', 'title' => 'ASC']], 'snc_serialize_programme_summary'),
        'leaders'      => snc_query(['post_type' => 'leader', 'posts_per_page' => 2, 'orderby' => ['menu_order' => 'ASC', 'date' => 'ASC']], 'snc_serialize_leader'),
        'news'         => snc_query(['post_type' => 'post', 'posts_per_page' => 3], 'snc_serialize_news_summary'),
        'gallery'      => $gallery,
        'testimonials' => snc_query([
            'post_type' => 'testimonials', 'posts_per_page' => 6,
            'meta_query' => [['key' => 'snc_consent', 'value' => '1']],
        ], 'snc_serialize_testimonial'),
    ];
}

function snc_rest_page(WP_REST_Request $req) {
    $path = trim(sanitize_text_field((string) $req->get_param('path')), '/');
    if ($path === '' || !preg_match('#^[a-z0-9-]+(/[a-z0-9-]+)*$#', $path)) {
        return snc_not_found('Page');
    }
    $page = get_page_by_path($path, OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish' || !empty($page->post_password)) {
        return snc_not_found('Page');
    }
    return snc_serialize_page($page);
}

function snc_rest_notices(WP_REST_Request $req) {
    $args = ['post_type' => 'circulars'] + snc_tax_query([snc_tax_clause('circular_type', $req->get_param('type'))]);
    $q = sanitize_text_field((string) $req->get_param('q'));
    if ($q !== '') {
        $args['s'] = $q;
    }
    return snc_paged($args, 'snc_serialize_notice', $req) + ['types' => snc_terms_in_use('circular_type')];
}

function snc_rest_merit_lists(WP_REST_Request $req) {
    $year = snc_resolve_year($req, 'merit_lists');
    $args = [
        'post_type'      => 'merit_lists',
        'posts_per_page' => 500,
        'orderby'        => ['date' => 'DESC', 'title' => 'ASC'],
    ] + snc_tax_query([
        snc_tax_clause('academic_year', $year),
        snc_tax_clause('programme', $req->get_param('programme')),
        snc_tax_clause('list_type', $req->get_param('list_type')),
        snc_tax_clause('merit_category', $req->get_param('category')),
    ]);
    return [
        'items'         => snc_query($args, 'snc_serialize_merit_list'),
        'selected_year' => $year,
        'years'         => snc_years_for_type('merit_lists'),
        'programmes'    => snc_terms_in_use('programme'),
        'list_types'    => snc_terms_in_use('list_type'),
        'categories'    => snc_terms_in_use('merit_category'),
    ];
}

function snc_rest_documents(WP_REST_Request $req) {
    $types = array_filter(array_map('sanitize_title', explode(',', (string) $req->get_param('type'))));
    $clauses = [
        $types ? ['taxonomy' => 'document_type', 'field' => 'slug', 'terms' => $types] : null,
        snc_tax_clause('academic_year', $req->get_param('year')),
        snc_tax_clause('programme', $req->get_param('programme')),
    ];
    $args = ['post_type' => 'documents', 'posts_per_page' => 500, 'orderby' => ['date' => 'DESC']] + snc_tax_query($clauses);
    return [
        'items' => snc_query($args, 'snc_serialize_document'),
        'years' => snc_years_for_type('documents'),
    ];
}

function snc_rest_programmes() {
    return snc_query(['post_type' => 'programs', 'posts_per_page' => 50, 'orderby' => ['menu_order' => 'ASC', 'title' => 'ASC']], 'snc_serialize_programme_summary');
}

function snc_rest_programme(WP_REST_Request $req) {
    $post = get_page_by_path((string) $req['slug'], OBJECT, 'programs');
    return ($post && $post->post_status === 'publish') ? snc_serialize_programme($post) : snc_not_found('Programme');
}

function snc_rest_faculty(WP_REST_Request $req) {
    $args = [
        'post_type' => 'faculty_staff', 'posts_per_page' => 300,
        'orderby'   => ['menu_order' => 'ASC', 'title' => 'ASC'],
    ] + snc_tax_query([snc_tax_clause('program_department', $req->get_param('department'))]);
    return snc_query($args, 'snc_serialize_person');
}

function snc_rest_committees(WP_REST_Request $req) {
    $year = snc_resolve_year($req, 'committees');
    $tax_query = [];
    if ($year !== '') {
        // Return committees tagged for this academic year OR untagged standing committees
        $tax_query = [
            'tax_query' => [
                'relation' => 'OR',
                [
                    'taxonomy' => 'academic_year',
                    'field'    => 'slug',
                    'terms'    => $year,
                ],
                [
                    'taxonomy' => 'academic_year',
                    'operator' => 'NOT EXISTS',
                ],
            ],
        ];
    }
    $args = [
        'post_type'      => 'committees',
        'posts_per_page' => 100,
        'orderby'        => ['menu_order' => 'ASC', 'title' => 'ASC'],
    ] + $tax_query;

    return [
        'items'         => snc_query($args, 'snc_serialize_committee'),
        'selected_year' => $year,
        'years'         => snc_years_for_type('committees'),
    ];
}

function snc_rest_leaders() {
    return snc_query(['post_type' => 'leader', 'posts_per_page' => 10, 'orderby' => ['menu_order' => 'ASC', 'date' => 'ASC']], 'snc_serialize_leader');
}

function snc_rest_gallery(WP_REST_Request $req) {
    return snc_paged(['post_type' => 'gallery'], 'snc_serialize_album_summary', $req, 12);
}

function snc_rest_album(WP_REST_Request $req) {
    $post = get_page_by_path((string) $req['slug'], OBJECT, 'gallery');
    return ($post && $post->post_status === 'publish') ? snc_serialize_album($post) : snc_not_found('Album');
}

function snc_rest_news(WP_REST_Request $req) {
    $cat = sanitize_title((string) $req->get_param('category'));
    $q   = sanitize_text_field((string) $req->get_param('q'));
    $args = ['post_type' => 'post'];
    if ($cat !== '') {
        $args['category_name'] = $cat;
    }
    if ($q !== '') {
        $args['s'] = $q;
    }
    // "Uncategorized" is WordPress's own fallback term and is never offered as a filter.
    $categories = array_values(array_filter(snc_terms_in_use('category'), fn($t) => $t['slug'] !== 'uncategorized'));
    return snc_paged($args, 'snc_serialize_news_summary', $req, 12) + ['categories' => $categories];
}

function snc_rest_news_item(WP_REST_Request $req) {
    $post = get_page_by_path((string) $req['slug'], OBJECT, 'post');
    return ($post && $post->post_status === 'publish') ? snc_serialize_news($post) : snc_not_found('News item');
}

function snc_rest_paths() {
    $pages = array_map('get_page_uri', get_posts(['post_type' => 'page', 'post_status' => 'publish', 'posts_per_page' => -1, 'has_password' => false]));
    $slugs = fn(string $type) => wp_list_pluck(get_posts(['post_type' => $type, 'post_status' => 'publish', 'posts_per_page' => -1]), 'post_name');
    return [
        'pages'      => array_values(array_filter($pages)),
        'programmes' => $slugs('programs'),
        'news'       => $slugs('post'),
        'gallery'    => $slugs('gallery'),
    ];
}
