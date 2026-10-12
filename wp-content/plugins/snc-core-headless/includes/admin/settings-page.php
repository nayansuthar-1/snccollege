<?php
/**
 * "SNC Settings" admin page (Plan B4 Site settings).
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_menu', function () {
    add_menu_page('SNC Settings', 'SNC Settings', 'manage_options', 'snc-settings', 'snc_render_settings_page', 'dashicons-admin-settings', 3);
});

add_action('admin_init', function () {
    register_setting('snc_settings_group', SNC_SETTINGS_OPTION, [
        'type'              => 'array',
        'sanitize_callback' => fn($input) => snc_sanitize_settings(is_array($input) ? wp_unslash($input) : []),
        'default'           => snc_settings_defaults(),
    ]);
});

function snc_render_settings_page(): void {
    if (!current_user_can('manage_options')) {
        return;
    }
    $settings = snc_get_settings();
    $schema = snc_settings_schema();
    $opt = SNC_SETTINGS_OPTION;
    ?>
    <div class="wrap snc-settings">
        <h1>SNC Settings</h1>
        <p class="description">These details appear across the website (header, footer, contact page, homepage). Enter only official, verified information.</p>
        <?php settings_errors(); ?>
        <form method="post" action="options.php">
            <?php settings_fields('snc_settings_group'); ?>
            <?php foreach (snc_settings_sections() as $section => $section_title) : ?>
                <div class="snc-card">
                    <h2><?php echo esc_html($section_title); ?></h2>
                    <?php
                    foreach ($schema as $key => [$sec, $label, $input, $desc]) {
                        if ($sec !== $section) {
                            continue;
                        }
                        if ($input === 'why') {
                            snc_render_why_rows($opt, $settings[$key]);
                            continue;
                        }
                        if ($input === 'facts') {
                            snc_render_fact_rows($opt, $settings[$key]);
                            continue;
                        }
                        snc_render_field("{$opt}[$key]", "snc_set_$key", ['input' => $input, 'label' => $label, 'desc' => $desc], $settings[$key]);
                    }
                    ?>
                </div>
            <?php endforeach; ?>
            <?php submit_button('Save settings'); ?>
        </form>
    </div>
    <?php
}

function snc_render_why_rows(string $opt, array $rows): void {
    echo '<div class="snc-field"><span class="snc-field__label">Why choose SNC (6 items)</span>';
    echo '<p class="description">Shown on the homepage as six cards. Keep each text to one short sentence.</p>';
    echo '<table class="widefat snc-rows"><thead><tr><th style="width:180px">Icon</th><th>Title</th><th>Text</th></tr></thead><tbody>';
    for ($i = 0; $i < 6; $i++) {
        $row = $rows[$i] ?? ['icon' => '', 'title' => '', 'text' => ''];
        echo '<tr><td><select name="' . esc_attr("{$opt}[why_items][$i][icon]") . '">';
        foreach (snc_why_icons() as $value => $label) {
            printf('<option value="%s" %s>%s</option>', esc_attr($value), selected($row['icon'], $value, false), esc_html($label));
        }
        echo '</select></td>';
        printf('<td><input type="text" class="widefat" name="%s" value="%s"></td>', esc_attr("{$opt}[why_items][$i][title]"), esc_attr($row['title']));
        printf('<td><input type="text" class="widefat" name="%s" value="%s"></td></tr>', esc_attr("{$opt}[why_items][$i][text]"), esc_attr($row['text']));
    }
    echo '</tbody></table></div>';
}

function snc_render_fact_rows(string $opt, array $rows): void {
    echo '<div class="snc-field"><span class="snc-field__label">Key facts (up to 4)</span>';
    echo '<p class="description">Short value + label, e.g. "2005" / "Established". Only facts the college can verify.</p>';
    echo '<table class="widefat snc-rows"><thead><tr><th style="width:220px">Value</th><th>Label</th></tr></thead><tbody>';
    for ($i = 0; $i < 4; $i++) {
        $row = $rows[$i] ?? ['value' => '', 'label' => ''];
        printf('<tr><td><input type="text" class="widefat" name="%s" value="%s"></td>', esc_attr("{$opt}[facts][$i][value]"), esc_attr($row['value']));
        printf('<td><input type="text" class="widefat" name="%s" value="%s"></td></tr>', esc_attr("{$opt}[facts][$i][label]"), esc_attr($row['label']));
    }
    echo '</tbody></table></div>';
}
