<?php
/**
 * Headless behaviour: WordPress is admin + API only (Plan Phase 3, task 1 "headless.php").
 */

if (!defined('ABSPATH')) {
    exit;
}

function snc_frontend_url(): string {
    return defined('SNC_FRONTEND_URL') ? untrailingslashit(SNC_FRONTEND_URL) : '';
}

/** Send visitors of the WordPress theme front-end to the Next.js site. */
add_action('template_redirect', function () {
    $frontend = snc_frontend_url();
    if ($frontend === '' || is_admin() || wp_doing_ajax() || wp_doing_cron() || is_preview()) {
        return;
    }
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return;
    }
    wp_redirect($frontend . '/', 302);
    exit;
}, 1);

/**
 * Add the trailing slash to /wp-admin.
 *
 * Apache and nginx redirect a directory request to its slashed form; PHP's built-in server
 * (php -S, which Laragon uses locally) does not. Without the slash the browser resolves the
 * admin menu's relative links against the site root, so every menu item 404s on /edit.php.
 */
add_action('admin_init', function () {
    $uri = (string) ($_SERVER['REQUEST_URI'] ?? '');
    if ($uri === '/wp-admin' || str_ends_with($uri, '/wp-admin')) {
        wp_safe_redirect(admin_url(), 301);
        exit;
    }
}, 0);

/** Keep the CMS out of search engines. */
add_action('send_headers', function () {
    header('X-Robots-Tag: noindex, nofollow', true);
});
add_filter('wp_robots', fn() => ['noindex' => true, 'nofollow' => true]);

/** Remove features a headless college CMS does not use. */
add_filter('xmlrpc_enabled', '__return_false');
add_filter('comments_open', '__return_false', 20);
add_filter('pings_open', '__return_false', 20);
add_action('init', function () {
    remove_post_type_support('post', 'comments');
    remove_post_type_support('page', 'comments');
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
});

/** Do not expose user accounts through the core REST API to anonymous visitors. */
add_filter('rest_endpoints', function (array $endpoints) {
    if (!current_user_can('list_users')) {
        foreach (array_keys($endpoints) as $route) {
            if (str_starts_with($route, '/wp/v2/users')) {
                unset($endpoints[$route]);
            }
        }
    }
    return $endpoints;
});
