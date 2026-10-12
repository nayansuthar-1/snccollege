<?php
/**
 * Custom post types (Plan B4). All are admin-only data types: not public, no front-end URLs,
 * not exposed via wp/v2 — the frontend reads them through snc/v1 only.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', 'snc_register_post_types');

/** Post types edited with the classic screen (title + fields), not the block editor. */
function snc_data_post_types(): array {
    return ['hero_slide', 'circulars', 'programs', 'merit_lists', 'documents', 'faculty_staff', 'committees', 'leader', 'gallery', 'testimonials'];
}

function snc_register_post_types(): void {
    $base = [
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_nav_menus'   => false,
        'show_in_rest'        => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
    ];

    $types = [
        'hero_slide' => [
            'labels'    => snc_cpt_labels('Homepage Slides', 'Homepage Slide'),
            'menu_icon' => 'dashicons-images-alt2',
            'supports'  => ['title', 'page-attributes'],
            'menu_position' => 21,
            'description'   => 'Banner images for the homepage slider. Use "Order" to sort; only published slides appear (max 5).',
        ],
        'circulars' => [
            'labels'    => snc_cpt_labels('Notices', 'Notice'),
            'menu_icon' => 'dashicons-megaphone',
            'supports'  => ['title', 'editor'],
            'menu_position' => 22,
        ],
        'merit_lists' => [
            'labels'    => snc_cpt_labels('Merit Lists', 'Merit List'),
            'menu_icon' => 'dashicons-list-view',
            'supports'  => ['title'],
            'menu_position' => 23,
        ],
        'documents' => [
            'labels'    => snc_cpt_labels('Documents & PDFs', 'Document'),
            'menu_icon' => 'dashicons-media-document',
            'supports'  => ['title'],
            'menu_position' => 24,
            'description'   => 'Syllabus, question papers, forms, reports, disclosures and other downloadable files.',
        ],
        'programs' => [
            'labels'    => snc_cpt_labels('Programmes', 'Programme'),
            'menu_icon' => 'dashicons-welcome-learn-more',
            'supports'  => ['title', 'editor', 'excerpt', 'thumbnail', 'page-attributes'],
            'menu_position' => 25,
        ],
        'faculty_staff' => [
            'labels'    => snc_cpt_labels('Faculty & Staff', 'Faculty / Staff Member'),
            'menu_icon' => 'dashicons-groups',
            'supports'  => ['title', 'thumbnail', 'page-attributes'],
            'menu_position' => 26,
        ],
        'committees' => [
            'labels'    => snc_cpt_labels('Committees', 'Committee'),
            'menu_icon' => 'dashicons-shield',
            'supports'  => ['title', 'editor', 'page-attributes'],
            'menu_position' => 27,
        ],
        'leader' => [
            'labels'    => snc_cpt_labels('Leadership Messages', 'Leadership Message'),
            'menu_icon' => 'dashicons-format-quote',
            'supports'  => ['title', 'editor', 'excerpt', 'thumbnail', 'page-attributes'],
            'menu_position' => 28,
        ],
        'gallery' => [
            'labels'    => snc_cpt_labels('Photo Albums', 'Photo Album'),
            'menu_icon' => 'dashicons-format-gallery',
            'supports'  => ['title', 'editor', 'thumbnail'],
            'menu_position' => 29,
        ],
        'testimonials' => [
            'labels'    => snc_cpt_labels('Testimonials', 'Testimonial'),
            'menu_icon' => 'dashicons-testimonial',
            'supports'  => ['title', 'editor', 'thumbnail'],
            'menu_position' => 30,
        ],
        'enquiry' => [
            'labels'       => snc_cpt_labels('Enquiries', 'Enquiry'),
            'menu_icon'    => 'dashicons-email-alt',
            'supports'     => ['title'],
            'menu_position' => 31,
            'capabilities' => ['create_posts' => 'do_not_allow'],
        ],
    ];

    foreach ($types as $type => $args) {
        register_post_type($type, array_merge($base, $args));
    }
}

function snc_cpt_labels(string $plural, string $singular): array {
    return [
        'name'               => $plural,
        'singular_name'      => $singular,
        'menu_name'          => $plural,
        'add_new'            => 'Add New',
        'add_new_item'       => "Add New $singular",
        'edit_item'          => "Edit $singular",
        'new_item'           => "New $singular",
        'view_item'          => "View $singular",
        'search_items'       => "Search $plural",
        'not_found'          => "No $plural found",
        'not_found_in_trash' => "No $plural found in Trash",
        'all_items'          => "All $plural",
    ];
}

/** Classic edit screen for data types — faster for office staff than the block editor. */
add_filter('use_block_editor_for_post_type', function (bool $use, string $post_type) {
    return in_array($post_type, snc_data_post_types(), true) ? false : $use;
}, 10, 2);
