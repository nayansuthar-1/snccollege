<?php
/**
 * Plugin Name: SNC College Headless Core
 * Plugin URI:  https://snccollegedpr.in/
 * Description: Content model, admin screens and REST API (snc/v1) for the Shiv Narayan Choubisa College headless website. See docs/02-IMPLEMENTATION-PLAN.md Part B.
 * Version:     2.0.0
 * Author:      Singularity Labs
 * License:     GPL-2.0+
 * Text Domain: snc-core
 * Requires PHP: 8.1
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SNC_CORE_VERSION', '2.0.0');
define('SNC_CORE_PATH', plugin_dir_path(__FILE__));
define('SNC_CORE_URL', plugin_dir_url(__FILE__));

require_once SNC_CORE_PATH . 'includes/post-types.php';
require_once SNC_CORE_PATH . 'includes/taxonomies.php';
require_once SNC_CORE_PATH . 'includes/meta.php';
require_once SNC_CORE_PATH . 'includes/settings.php';
require_once SNC_CORE_PATH . 'includes/headless.php';
require_once SNC_CORE_PATH . 'includes/revalidate.php';
require_once SNC_CORE_PATH . 'includes/rest/serializers.php';
require_once SNC_CORE_PATH . 'includes/rest/routes.php';
require_once SNC_CORE_PATH . 'includes/rest/enquiry.php';

if (is_admin()) {
    require_once SNC_CORE_PATH . 'includes/admin/fields.php';
    require_once SNC_CORE_PATH . 'includes/admin/meta-boxes.php';
    require_once SNC_CORE_PATH . 'includes/admin/settings-page.php';
    require_once SNC_CORE_PATH . 'includes/admin/admin-ux.php';
}

if (defined('WP_CLI') && WP_CLI) {
    require_once SNC_CORE_PATH . 'seed/seed.php';
    WP_CLI::add_command('snc seed', 'snc_seed_cli');
}

register_activation_hook(__FILE__, function () {
    snc_register_post_types();
    snc_register_taxonomies();
    snc_insert_default_terms();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});

/** Re-run default-term insertion once per plugin version (activation hook does not fire on file updates). */
add_action('init', function () {
    if (get_option('snc_core_version') !== SNC_CORE_VERSION) {
        snc_insert_default_terms();
        update_option('snc_core_version', SNC_CORE_VERSION, false);
    }
}, 20);
