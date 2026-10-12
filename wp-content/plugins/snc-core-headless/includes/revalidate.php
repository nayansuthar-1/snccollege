<?php
/**
 * On-demand revalidation of the Next.js cache (Plan B6).
 * POST {SNC_FRONTEND_URL}/api/revalidate  header x-snc-secret, body {"tags": [...]}
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Cache tags affected by each post type. */
function snc_tags_for_post_type(string $post_type): array {
    return match ($post_type) {
        'hero_slide'    => ['slides', 'home'],
        'circulars'     => ['notices', 'home'],
        'merit_lists'   => ['merit-lists'],
        'documents'     => ['documents'],
        'programs'      => ['programmes', 'home', 'paths'],
        'faculty_staff' => ['faculty'],
        'committees'    => ['committees'],
        'leader'        => ['leaders', 'home'],
        'gallery'       => ['gallery', 'home', 'paths'],
        'testimonials'  => ['testimonials', 'home'],
        'post'          => ['news', 'home', 'paths'],
        'page'          => ['pages', 'paths'],
        default         => [],
    };
}

/** Tags queued during this request; sent once at shutdown. */
function snc_queue_revalidate(array $tags): void {
    $GLOBALS['snc_revalidate_tags'] = array_values(array_unique(array_merge($GLOBALS['snc_revalidate_tags'] ?? [], $tags)));
}

function snc_queue_post_revalidate(int $post_id): void {
    $post = get_post($post_id);
    if (!$post || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id) || $post->post_status === 'auto-draft') {
        return;
    }
    $tags = snc_tags_for_post_type($post->post_type);
    if ($post->post_type === 'page') {
        $tags[] = 'page:' . get_page_uri($post);
    }
    if ($tags) {
        snc_queue_revalidate($tags);
    }
}

add_action('save_post', 'snc_queue_post_revalidate');
add_action('deleted_post', 'snc_queue_post_revalidate');
add_action('trashed_post', 'snc_queue_post_revalidate');
add_action('untrashed_post', 'snc_queue_post_revalidate');
add_action('edited_term', function ($term_id, $tt_id, $taxonomy) {
    $map = [
        'circular_type' => ['notices', 'home'], 'academic_year' => ['merit-lists', 'documents', 'committees'],
        'programme' => ['merit-lists', 'documents', 'programmes'], 'list_type' => ['merit-lists'],
        'merit_category' => ['merit-lists'], 'document_type' => ['documents'], 'program_level' => ['programmes', 'home'],
        'program_department' => ['faculty'], 'staff_type' => ['faculty'], 'category' => ['news', 'home'],
    ];
    if (isset($map[$taxonomy])) {
        snc_queue_revalidate($map[$taxonomy]);
    }
}, 10, 3);
add_action('update_option_' . SNC_SETTINGS_OPTION, fn() => snc_queue_revalidate(['settings', 'home']));
add_action('add_option_' . SNC_SETTINGS_OPTION, fn() => snc_queue_revalidate(['settings', 'home']));

add_action('shutdown', function () {
    $tags = $GLOBALS['snc_revalidate_tags'] ?? [];
    $frontend = snc_frontend_url();
    if (!$tags || $frontend === '' || !defined('SNC_REVALIDATE_SECRET') || SNC_REVALIDATE_SECRET === '') {
        return;
    }
    // The frontend accepts max 20 tags; bulk edits collapse per-page tags into "pages" (every page fetch carries it).
    if (count($tags) > 20) {
        $tags = array_values(array_unique(array_merge(array_filter($tags, fn($t) => !str_starts_with($t, 'page:')), ['pages'])));
    }
    $response = wp_remote_post($frontend . '/api/revalidate', [
        'timeout'  => 3,
        'blocking' => defined('WP_DEBUG') && WP_DEBUG, // blocking in debug so failures are logged
        'headers'  => ['Content-Type' => 'application/json', 'x-snc-secret' => SNC_REVALIDATE_SECRET],
        'body'     => wp_json_encode(['tags' => array_slice($tags, 0, 20)]),
    ]);
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $code = is_wp_error($response) ? $response->get_error_message() : wp_remote_retrieve_response_code($response);
        error_log('[snc] revalidate ' . implode(',', $tags) . ' → ' . $code);
    }
});
