<?php
/**
 * Admin usability for non-technical editors (Plan Phase 3 task 6).
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Rename "Posts" to "News & Events". */
add_action('init', function () {
    $labels = get_post_type_object('post')->labels;
    $labels->name = 'News & Events';
    $labels->singular_name = 'News Item';
    $labels->menu_name = 'News & Events';
    $labels->name_admin_bar = 'News Item';
    $labels->add_new_item = 'Add News Item';
    $labels->edit_item = 'Edit News Item';
    $labels->all_items = 'All News & Events';
    $labels->search_items = 'Search News';
    $labels->not_found = 'No news found';
});

/** Hide menus the college does not use. */
add_action('admin_menu', function () {
    remove_menu_page('edit-comments.php');
}, 999);

/** Clearer title placeholders. */
add_filter('enter_title_here', function (string $text, WP_Post $post) {
    return match ($post->post_type) {
        'circulars'     => 'Notice title, e.g. "B.A. Part I examination form schedule"',
        'merit_lists'   => 'List title, e.g. "B.A. Part I Merit List 1 (General)"',
        'documents'     => 'Document title, e.g. "B.Sc. Semester I Syllabus"',
        'faculty_staff' => 'Full name, e.g. "Dr. Name Surname"',
        'leader'        => 'Full name',
        'testimonials'  => 'Student / alumni name',
        'gallery'       => 'Album title, e.g. "Annual Function 2026"',
        'hero_slide'    => 'Internal name (not shown on the website)',
        'committees'    => 'Committee name',
        default         => $text,
    };
}, 10, 2);

/** Taxonomy filter dropdowns on list screens. */
add_action('restrict_manage_posts', function (string $post_type) {
    foreach (snc_taxonomy_definitions() as $taxonomy => $def) {
        if (!in_array($post_type, $def['types'], true)) {
            continue;
        }
        wp_dropdown_categories([
            'show_option_all' => 'All ' . strtolower($def['plural']),
            'taxonomy'        => $taxonomy,
            'name'            => $taxonomy,
            'value_field'     => 'slug',
            'selected'        => sanitize_title($_GET[$taxonomy] ?? ''),
            'hide_empty'      => false,
            'hierarchical'    => true,
            'orderby'         => 'name',
        ]);
    }
});

/** Apply the dropdown filters (taxonomies have no public query var). */
add_action('pre_get_posts', function (WP_Query $query) {
    if (!$query->is_main_query() || !function_exists('get_current_screen')) {
        return;
    }
    $screen = get_current_screen();
    if (!$screen || $screen->base !== 'edit') {
        return;
    }
    $clauses = [];
    foreach (snc_taxonomy_definitions() as $taxonomy => $def) {
        $slug = sanitize_title($_GET[$taxonomy] ?? '');
        if ($slug !== '' && $slug !== '0' && in_array($screen->post_type, $def['types'], true)) {
            $clauses[] = ['taxonomy' => $taxonomy, 'field' => 'slug', 'terms' => $slug];
        }
    }
    if ($clauses) {
        $query->set('tax_query', array_merge(['relation' => 'AND'], $clauses));
    }
});

/** Show whether a notice/list/document has its file attached. */
foreach (['circulars', 'merit_lists', 'documents'] as $snc_type) {
    add_filter("manage_{$snc_type}_posts_columns", function (array $cols) {
        $cols['snc_file'] = 'File';
        return $cols;
    });
    add_action("manage_{$snc_type}_posts_custom_column", function (string $col, int $post_id) {
        if ($col !== 'snc_file') {
            return;
        }
        $file = snc_file((int) get_post_meta($post_id, 'snc_document_id', true));
        if ($file) {
            printf('<a href="%s" target="_blank" rel="noopener">%s</a>', esc_url($file['url']), esc_html($file['filename']));
        } elseif (get_post_meta($post_id, 'snc_external_url', true)) {
            echo 'External link';
        } else {
            echo '<span style="color:#b32d2e">Missing</span>';
        }
    }, 10, 2);
}

/** Enquiry list: show phone and programme. */
add_filter('manage_enquiry_posts_columns', fn(array $cols) => array_merge($cols, ['snc_phone' => 'Mobile', 'snc_programme' => 'Programme']));
add_action('manage_enquiry_posts_custom_column', function (string $col, int $post_id) {
    if (in_array($col, ['snc_phone', 'snc_programme'], true)) {
        echo esc_html((string) get_post_meta($post_id, $col, true));
    }
}, 10, 2);

/** Read-only enquiry details box. */
add_action('add_meta_boxes_enquiry', function () {
    add_meta_box('snc_enquiry', 'Enquiry details', function (WP_Post $post) {
        $rows = ['Mobile' => 'snc_phone', 'Email' => 'snc_email', 'Programme' => 'snc_programme', 'Message' => 'snc_message'];
        echo '<table class="form-table"><tbody>';
        foreach ($rows as $label => $key) {
            printf('<tr><th>%s</th><td>%s</td></tr>', esc_html($label), nl2br(esc_html((string) get_post_meta($post->ID, $key, true))));
        }
        printf('<tr><th>Received</th><td>%s</td></tr>', esc_html(get_the_date('j M Y, g:i a', $post)));
        echo '</tbody></table>';
    }, 'enquiry', 'normal', 'high');
});
