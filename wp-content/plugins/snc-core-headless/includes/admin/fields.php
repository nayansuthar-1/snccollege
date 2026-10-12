<?php
/**
 * Admin field renderers shared by meta boxes and the settings page.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_enqueue_scripts', function (string $hook) {
    $screen = get_current_screen();
    $is_edit = in_array($hook, ['post.php', 'post-new.php'], true) && $screen && isset(snc_field_registry()[$screen->post_type]);
    $is_settings = $hook === 'toplevel_page_snc-settings';
    if (!$is_edit && !$is_settings) {
        return;
    }
    wp_enqueue_media();
    wp_enqueue_script('snc-admin', SNC_CORE_URL . 'assets/admin.js', ['jquery'], SNC_CORE_VERSION, true);
    wp_enqueue_style('snc-admin', SNC_CORE_URL . 'assets/admin.css', [], SNC_CORE_VERSION);
});

/** Render one field. $name is the form field name, $value the stored value. */
function snc_render_field(string $name, string $id, array $field, mixed $value): void {
    $input = $field['input'];
    $desc = $field['desc'] ?? '';
    $required = !empty($field['required']);

    echo '<div class="snc-field snc-field--' . esc_attr($input) . '">';
    if ($input !== 'checkbox') {
        printf(
            '<label class="snc-field__label" for="%s">%s%s</label>',
            esc_attr($id),
            esc_html($field['label']),
            $required ? ' <span class="snc-required" aria-hidden="true">*</span>' : ''
        );
    }

    switch ($input) {
        case 'textarea':
        case 'lines':
            printf('<textarea class="large-text" rows="%d" id="%s" name="%s">%s</textarea>', $input === 'lines' ? 6 : 3, esc_attr($id), esc_attr($name), esc_textarea((string) $value));
            break;

        case 'checkbox':
            printf(
                '<label for="%1$s"><input type="checkbox" id="%1$s" name="%2$s" value="1" %3$s> %4$s</label>',
                esc_attr($id),
                esc_attr($name),
                checked((bool) $value, true, false),
                esc_html($field['label'])
            );
            break;

        case 'image':
        case 'file':
            $att_id = absint($value);
            $preview = '';
            if ($att_id) {
                $preview = $input === 'image'
                    ? wp_get_attachment_image($att_id, 'thumbnail')
                    : esc_html(wp_basename((string) get_attached_file($att_id)));
            }
            printf(
                '<div class="snc-media" data-type="%1$s">
                    <input type="hidden" id="%2$s" name="%3$s" value="%4$s" class="snc-media__input">
                    <div class="snc-media__preview">%5$s</div>
                    <button type="button" class="button snc-media__select">%6$s</button>
                    <button type="button" class="button-link snc-media__remove"%7$s>Remove</button>
                </div>',
                esc_attr($input),
                esc_attr($id),
                esc_attr($name),
                esc_attr($att_id ?: ''),
                $preview, // escaped above / core markup
                $input === 'image' ? 'Select image' : 'Select or upload file',
                $att_id ? '' : ' hidden'
            );
            break;

        case 'gallery':
            $ids = array_filter(array_map('absint', explode(',', (string) $value)));
            echo '<div class="snc-gallery">';
            printf('<input type="hidden" id="%s" name="%s" value="%s" class="snc-gallery__input">', esc_attr($id), esc_attr($name), esc_attr(implode(',', $ids)));
            echo '<ul class="snc-gallery__list">';
            foreach ($ids as $att_id) {
                printf('<li data-id="%d">%s</li>', $att_id, wp_get_attachment_image($att_id, 'thumbnail'));
            }
            echo '</ul><button type="button" class="button snc-gallery__select">Add / edit photos</button> ';
            echo '<button type="button" class="button-link snc-gallery__clear">Remove all</button></div>';
            break;

        case 'members':
            $rows = json_decode((string) $value, true);
            $rows = is_array($rows) && $rows ? $rows : [['name' => '', 'designation' => '', 'role' => '']];
            echo '<table class="widefat snc-repeater" data-name="' . esc_attr($name) . '"><thead><tr><th>Name</th><th>Designation</th><th>Role in committee</th><th></th></tr></thead><tbody>';
            foreach ($rows as $i => $row) {
                snc_render_member_row($name, $i, $row);
            }
            echo '</tbody></table><p><button type="button" class="button snc-repeater__add">Add member</button></p>';
            echo '<template class="snc-repeater__template">';
            snc_render_member_row($name, '__INDEX__', ['name' => '', 'designation' => '', 'role' => '']);
            echo '</template>';
            break;

        case 'select':
            printf('<select id="%s" name="%s">', esc_attr($id), esc_attr($name));
            foreach (($field['options'] ?? []) as $option_value => $option_label) {
                printf(
                    '<option value="%s" %s>%s</option>',
                    esc_attr((string) $option_value),
                    selected((string) $value, (string) $option_value, false),
                    esc_html($option_label)
                );
            }
            echo '</select>';
            break;

        default:
            $type = in_array($input, ['url', 'email'], true) ? ($input === 'url' ? 'text' : 'email') : 'text';
            printf('<input type="%s" class="regular-text" id="%s" name="%s" value="%s">', esc_attr($type), esc_attr($id), esc_attr($name), esc_attr((string) $value));
    }

    if ($desc !== '') {
        printf('<p class="description">%s</p>', esc_html($desc));
    }
    echo '</div>';
}

function snc_render_member_row(string $name, int|string $i, array $row): void {
    echo '<tr>';
    foreach (['name', 'designation', 'role'] as $col) {
        printf('<td><input type="text" class="widefat" name="%s[%s][%s]" value="%s"></td>', esc_attr($name), esc_attr((string) $i), $col, esc_attr($row[$col] ?? ''));
    }
    echo '<td><button type="button" class="button-link snc-repeater__remove" aria-label="Remove row">Remove</button></td></tr>';
}
