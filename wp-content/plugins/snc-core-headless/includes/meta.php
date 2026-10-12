<?php
/**
 * Field registry (Plan B4). One definition drives meta registration, admin meta boxes and sanitising.
 *
 * Field inputs: text, textarea, url, email, checkbox, image (attachment ID), file (attachment ID),
 * gallery (comma-separated attachment IDs), lines (one item per line), members (JSON rows).
 */

if (!defined('ABSPATH')) {
    exit;
}

function snc_field_registry(): array {
    return [
        'hero_slide' => [
            'title' => 'Slide',
            'fields' => [
                'snc_image_desktop' => ['input' => 'image', 'label' => 'Desktop image', 'required' => true, 'desc' => '1920 × 720 px (wide). Required.'],
                'snc_image_mobile'  => ['input' => 'image', 'label' => 'Mobile image', 'desc' => '1080 × 1350 px (portrait). Optional; the desktop image is used if empty.'],
                'snc_eyebrow'       => ['input' => 'text', 'label' => 'Small label above heading', 'desc' => 'e.g. "Admissions 2026-27". Leave all text empty if the image already contains text.'],
                'snc_heading'       => ['input' => 'text', 'label' => 'Heading'],
                'snc_subtext'       => ['input' => 'textarea', 'label' => 'Supporting text', 'desc' => 'One or two short sentences.'],
                'snc_cta1_label'    => ['input' => 'text', 'label' => 'Main button label'],
                'snc_cta1_url'      => ['input' => 'url', 'label' => 'Main button link', 'desc' => 'Site path like /admissions or a full https:// link.'],
                'snc_cta2_label'    => ['input' => 'text', 'label' => 'Second button label'],
                'snc_cta2_url'      => ['input' => 'url', 'label' => 'Second button link'],
                'snc_link_url'      => ['input' => 'url', 'label' => 'Whole-slide link', 'desc' => 'Only used when the slide has no heading (designed banner).'],
            ],
        ],
        'circulars' => [
            'title' => 'Notice file or link',
            'fields' => [
                'snc_document_id'  => ['input' => 'file', 'label' => 'Notice PDF', 'desc' => 'Upload the PDF. File size is detected automatically.'],
                'snc_external_url' => ['input' => 'url', 'label' => 'Or external link', 'desc' => 'Use when the notice lives on another website (e.g. GGTU).'],
                'snc_is_important' => ['input' => 'checkbox', 'label' => 'Mark as important'],
            ],
        ],
        'merit_lists' => [
            'title' => 'List file',
            'fields' => [
                'snc_document_id' => ['input' => 'file', 'label' => 'List PDF', 'required' => true, 'desc' => 'Also tick Session, Programme Tag, List Type and Category in the right column.'],
            ],
        ],
        'documents' => [
            'title' => 'Document file or link',
            'fields' => [
                'snc_document_id'  => ['input' => 'file', 'label' => 'File', 'desc' => 'Upload the PDF/DOC. Tick the Document Type in the right column.'],
                'snc_external_url' => ['input' => 'url', 'label' => 'Or external link'],
            ],
        ],
        'programs' => [
            'title' => 'Programme details',
            'fields' => [
                'snc_short_name'           => ['input' => 'text', 'label' => 'Short name', 'desc' => 'e.g. B.A.'],
                'snc_duration'             => ['input' => 'text', 'label' => 'Duration', 'desc' => 'e.g. 3 years'],
                'snc_pattern'              => ['input' => 'text', 'label' => 'Pattern', 'desc' => 'e.g. Semester pattern'],
                'snc_eligibility'          => ['input' => 'textarea', 'label' => 'Eligibility'],
                'snc_subjects'             => ['input' => 'lines', 'label' => 'Subjects', 'desc' => 'One subject (or combination) per line.'],
                'snc_career_paths'         => ['input' => 'lines', 'label' => 'Career paths', 'desc' => 'One per line.'],
                'snc_syllabus_document_id' => ['input' => 'file', 'label' => 'Syllabus PDF'],
                'snc_intake'               => ['input' => 'text', 'label' => 'Intake / seats', 'desc' => 'Optional. Shown only if filled.'],
                'snc_fee_note'             => ['input' => 'text', 'label' => 'Fee note', 'desc' => 'Optional. Shown only if filled. Use official figures only.'],
            ],
        ],
        'faculty_staff' => [
            'title' => 'Profile',
            'fields' => [
                'snc_designation'    => ['input' => 'text', 'label' => 'Designation', 'desc' => 'e.g. Assistant Professor (Chemistry)'],
                'snc_qualification'  => ['input' => 'text', 'label' => 'Qualification', 'desc' => 'e.g. M.Sc., B.Ed., Ph.D.'],
                'snc_experience'     => ['input' => 'text', 'label' => 'Experience', 'desc' => 'e.g. 8 years'],
                'snc_email'          => ['input' => 'email', 'label' => 'Email'],
                'snc_public_contact' => ['input' => 'checkbox', 'label' => 'Show email on the website'],
            ],
        ],
        'committees' => [
            'title' => 'Committee members',
            'fields' => [
                'snc_convener'          => ['input' => 'text', 'label' => 'Convener'],
                'snc_members_json'      => ['input' => 'members', 'label' => 'Members'],
                'snc_order_document_id' => ['input' => 'file', 'label' => 'Office order PDF'],
            ],
        ],
        'leader' => [
            'title' => 'Leader details',
            'fields' => [
                'snc_designation' => ['input' => 'text', 'label' => 'Designation', 'desc' => 'e.g. Principal. Put the short quote (max 60 words) in "Excerpt" and the full message in the editor.'],
            ],
        ],
        'gallery' => [
            'title' => 'Photos',
            'fields' => [
                'snc_photo_ids' => ['input' => 'gallery', 'label' => 'Album photos', 'desc' => 'Select or upload photos. Add a caption to each photo in the media library.'],
            ],
        ],
        'testimonials' => [
            'title' => 'Review details',
            'fields' => [
                'snc_source'          => ['input' => 'select', 'label' => 'Where this review came from', 'options' => ['college' => 'Given directly to the college', 'google' => 'Google review'], 'desc' => 'Google reviews are shown with the Google mark and a link to the original.'],
                'snc_programme_batch' => ['input' => 'text', 'label' => 'Programme & batch', 'desc' => 'e.g. B.Sc., 2023. Leave empty for a Google review by a non-student.'],
                'snc_rating'          => ['input' => 'select', 'label' => 'Star rating', 'options' => ['' => 'No rating', '5' => '5 stars', '4' => '4 stars', '3' => '3 stars', '2' => '2 stars', '1' => '1 star'], 'desc' => 'As given on Google. Leave as “No rating” for a written testimonial with no stars.'],
                'snc_review_date'     => ['input' => 'text', 'label' => 'Review date', 'desc' => 'YYYY-MM-DD, as shown on Google.'],
                'snc_review_url'      => ['input' => 'url', 'label' => 'Link to the original review', 'desc' => 'The Google review permalink. Required for Google reviews so readers can verify it.'],
                'snc_consent'         => ['input' => 'checkbox', 'label' => 'Cleared to publish', 'desc' => 'Tick only for a review that is genuinely public on Google, or a testimonial the person has agreed in writing to publish. Nothing is shown on the website without this.'],
            ],
        ],
        'page' => [
            'title' => 'Page header',
            'fields' => [
                'snc_hero_subtitle' => ['input' => 'text', 'label' => 'Subtitle under the page title', 'desc' => 'One short sentence. The featured image (if set) is used as a faint background.'],
            ],
        ],
    ];
}

function snc_field_meta_type(string $input): string {
    return match ($input) {
        'image', 'file' => 'integer',
        'checkbox'      => 'boolean',
        default         => 'string',
    };
}

add_action('init', function () {
    foreach (snc_field_registry() as $post_type => $group) {
        foreach ($group['fields'] as $key => $field) {
            register_post_meta($post_type, $key, [
                'type'              => snc_field_meta_type($field['input']),
                'single'            => true,
                'show_in_rest'      => false,
                'sanitize_callback' => fn($value) => snc_sanitize_field_value($field['input'], $value),
                'auth_callback'     => fn() => current_user_can('edit_posts'),
            ]);
        }
    }
});

/** Sanitise one field value according to its input type. */
function snc_sanitize_field_value(string $input, mixed $value): mixed {
    switch ($input) {
        case 'image':
        case 'file':
            return absint($value);
        case 'checkbox':
            return (bool) $value;
        case 'url':
            $value = trim((string) $value);
            if ($value === '') {
                return '';
            }
            // Allow site-relative paths such as /admissions.
            return str_starts_with($value, '/') ? '/' . ltrim(sanitize_text_field($value), '/') : esc_url_raw($value, ['http', 'https']);
        case 'email':
            return sanitize_email((string) $value);
        case 'textarea':
        case 'lines':
            return sanitize_textarea_field((string) $value);
        case 'gallery':
            $ids = array_filter(array_map('absint', explode(',', (string) $value)));
            return implode(',', array_unique($ids));
        case 'members':
            $rows = is_array($value) ? $value : json_decode((string) $value, true);
            $clean = [];
            foreach ((array) $rows as $row) {
                $name = sanitize_text_field($row['name'] ?? '');
                if ($name === '') {
                    continue;
                }
                $clean[] = [
                    'name'        => $name,
                    'designation' => sanitize_text_field($row['designation'] ?? ''),
                    'role'        => sanitize_text_field($row['role'] ?? ''),
                ];
            }
            return wp_json_encode($clean);
        default:
            return sanitize_text_field((string) $value);
    }
}
