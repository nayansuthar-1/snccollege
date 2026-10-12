<?php
/**
 * Registry-driven meta boxes for every post type in snc_field_registry().
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('add_meta_boxes', function (string $post_type) {
    $registry = snc_field_registry();
    if (!isset($registry[$post_type])) {
        return;
    }
    add_meta_box('snc_fields', $registry[$post_type]['title'], 'snc_render_meta_box', $post_type, 'normal', 'high');
});

function snc_render_meta_box(WP_Post $post): void {
    $group = snc_field_registry()[$post->post_type];
    wp_nonce_field('snc_save_fields', 'snc_fields_nonce');
    echo '<div class="snc-fields">';
    foreach ($group['fields'] as $key => $field) {
        $value = get_post_meta($post->ID, $key, true);
        snc_render_field("snc_fields[$key]", $key, $field, $value);
    }
    echo '</div>';
}

add_action('save_post', function (int $post_id, WP_Post $post) {
    if (!isset($_POST['snc_fields_nonce']) || !wp_verify_nonce(sanitize_key($_POST['snc_fields_nonce']), 'snc_save_fields')) {
        return;
    }
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($post_id) || !current_user_can('edit_post', $post_id)) {
        return;
    }
    $registry = snc_field_registry();
    if (!isset($registry[$post->post_type])) {
        return;
    }
    $submitted = isset($_POST['snc_fields']) && is_array($_POST['snc_fields']) ? wp_unslash($_POST['snc_fields']) : [];
    foreach ($registry[$post->post_type]['fields'] as $key => $field) {
        $raw = $submitted[$key] ?? ($field['input'] === 'checkbox' ? false : '');
        if ($field['input'] === 'members' && is_array($raw)) {
            $raw = array_values($raw);
        }
        $clean = snc_sanitize_field_value($field['input'], $raw);
        $empty = $clean === '' || $clean === 0 || $clean === false || $clean === '[]';
        if ($empty) {
            delete_post_meta($post_id, $key);
        } else {
            update_post_meta($post_id, $key, $clean);
        }
    }
}, 10, 2);

/** Remind editors when a required file/image is missing. */
add_action('admin_notices', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->base !== 'post' || empty($_GET['post'])) {
        return;
    }
    $post_id = absint($_GET['post']);
    $group = snc_field_registry()[$screen->post_type] ?? null;
    if (!$group) {
        return;
    }
    foreach ($group['fields'] as $key => $field) {
        if (!empty($field['required']) && !get_post_meta($post_id, $key, true)) {
            printf('<div class="notice notice-warning"><p><strong>%s</strong> is required — this item will not appear on the website until it is added.</p></div>', esc_html($field['label']));
        }
    }
});
