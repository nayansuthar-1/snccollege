<?php
/**
 * Taxonomies (Plan B4). Shared taxonomies are registered once and attached to every type that uses them.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', 'snc_register_taxonomies', 5);

function snc_taxonomy_definitions(): array {
    return [
        'academic_year' => [
            'types'  => ['merit_lists', 'documents', 'committees'],
            'plural' => 'Sessions',
            'single' => 'Session',
            'desc'   => 'Academic session, e.g. 2026-27.',
        ],
        'programme' => [
            'types'  => ['programs', 'merit_lists', 'documents'],
            'plural' => 'Programme Tags',
            'single' => 'Programme Tag',
            'desc'   => 'Short programme code used for filtering (B.A., B.Sc.).',
        ],
        'program_level' => [
            'types'  => ['programs'],
            'plural' => 'Programme Levels',
            'single' => 'Programme Level',
        ],
        'list_type' => [
            'types'  => ['merit_lists'],
            'plural' => 'List Types',
            'single' => 'List Type',
        ],
        'merit_category' => [
            'types'  => ['merit_lists'],
            'plural' => 'Categories',
            'single' => 'Category',
        ],
        'circular_type' => [
            'types'  => ['circulars'],
            'plural' => 'Notice Types',
            'single' => 'Notice Type',
        ],
        'document_type' => [
            'types'  => ['documents'],
            'plural' => 'Document Types',
            'single' => 'Document Type',
        ],
        'program_department' => [
            'types'  => ['faculty_staff'],
            'plural' => 'Departments',
            'single' => 'Department',
        ],
        'staff_type' => [
            'types'  => ['faculty_staff'],
            'plural' => 'Staff Types',
            'single' => 'Staff Type',
        ],
    ];
}

function snc_register_taxonomies(): void {
    foreach (snc_taxonomy_definitions() as $taxonomy => $def) {
        register_taxonomy($taxonomy, $def['types'], [
            'labels' => [
                'name'          => $def['plural'],
                'singular_name' => $def['single'],
                'menu_name'     => $def['plural'],
                'all_items'     => 'All ' . $def['plural'],
                'edit_item'     => 'Edit ' . $def['single'],
                'add_new_item'  => 'Add New ' . $def['single'],
                'search_items'  => 'Search ' . $def['plural'],
            ],
            'description'       => $def['desc'] ?? '',
            'public'            => false,
            'publicly_queryable' => false,
            'hierarchical'      => true,   // checkbox UI in the classic editor
            'show_ui'           => true,
            'show_in_rest'      => false,
            'show_admin_column' => true,
            'show_in_nav_menus' => false,
            'rewrite'           => false,
            'query_var'         => false,
        ]);
    }
}

/** Default terms: slug => name. Inserted on activation and on plugin version change. */
function snc_default_terms(): array {
    return [
        'academic_year' => ['2026-27' => '2026-27', '2025-26' => '2025-26', '2024-25' => '2024-25'],
        'programme'     => ['ba' => 'B.A.', 'bsc' => 'B.Sc.'],
        'program_level' => ['ug' => 'Undergraduate', 'pg' => 'Postgraduate', 'diploma' => 'Diploma'],
        'list_type'     => [
            'merit'                => 'Merit List',
            'waiting'              => 'Waiting List',
            'provisional-admitted' => 'Provisional Admitted List',
            'final-admitted'       => 'Final Admitted List',
            'other'                => 'Other',
        ],
        'merit_category' => [
            'all' => 'All Categories', 'general' => 'General', 'obc' => 'OBC', 'sc' => 'SC', 'st' => 'ST',
            'ews' => 'EWS', 'mbc' => 'MBC', 'divyang' => 'Divyang',
        ],
        'circular_type' => [
            'admission' => 'Admission', 'examination' => 'Examination', 'scholarship' => 'Scholarship',
            'academic' => 'Academic', 'events' => 'Events', 'general' => 'General',
        ],
        'document_type' => [
            'syllabus' => 'Syllabus', 'question-paper' => 'Question Paper', 'form' => 'Form',
            'calendar' => 'Academic Calendar', 'naac' => 'NAAC', 'aqar' => 'AQAR', 'aishe' => 'AISHE Report',
            'annual-report' => 'Annual Report', 'disclosure' => 'Mandatory Disclosure', 'compliance' => 'UGC / Statutory Compliance',
            'fee' => 'Fee Structure', 'committee-order' => 'Committee Order', 'anti-ragging' => 'Anti-Ragging', 'other' => 'Other',
        ],
        'program_department' => ['arts' => 'Arts', 'science' => 'Science', 'administration' => 'Administration'],
        'staff_type'         => ['teaching' => 'Teaching', 'non-teaching' => 'Non-teaching'],
        'category'           => ['news' => 'News', 'events' => 'Events', 'press-notes' => 'Press Notes'],
    ];
}

function snc_insert_default_terms(): void {
    foreach (snc_default_terms() as $taxonomy => $terms) {
        if (!taxonomy_exists($taxonomy)) {
            continue;
        }
        foreach ($terms as $slug => $name) {
            if (!term_exists($slug, $taxonomy)) {
                wp_insert_term($name, $taxonomy, ['slug' => $slug]);
            }
        }
    }
}
