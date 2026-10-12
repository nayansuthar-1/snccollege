<?php
/**
 * POST /snc/v1/enquiry — admission enquiry form (Plan B5, Phase 3 task 1).
 *
 * The Next.js server calls this server-to-server. To rate-limit per visitor (not per Next server),
 * it forwards the visitor IP in x-snc-client-ip together with x-snc-secret; the header is trusted
 * only when the secret matches.
 */

if (!defined('ABSPATH')) {
    exit;
}

const SNC_ENQUIRY_LIMIT = 5;          // submissions …
const SNC_ENQUIRY_WINDOW = 600;       // … per 10 minutes per IP

add_action('rest_api_init', function () {
    register_rest_route(SNC_REST_NS, '/enquiry', [
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'snc_rest_enquiry',
        'permission_callback' => '__return_true',
    ]);
});

function snc_enquiry_client_ip(WP_REST_Request $req): string {
    $secret = defined('SNC_REVALIDATE_SECRET') ? (string) SNC_REVALIDATE_SECRET : '';
    $sent = (string) $req->get_header('x-snc-secret');
    $forwarded = (string) $req->get_header('x-snc-client-ip');
    if ($secret !== '' && $sent !== '' && hash_equals($secret, $sent) && filter_var($forwarded, FILTER_VALIDATE_IP)) {
        return $forwarded;
    }
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '');
}

function snc_rest_enquiry(WP_REST_Request $req) {
    $params = $req->get_json_params() ?: $req->get_body_params();

    // Honeypot: real visitors never fill the hidden "website" field.
    if (!empty($params['website'])) {
        return new WP_REST_Response(['ok' => false, 'errors' => ['form' => 'Invalid submission.']], 400);
    }

    $name      = sanitize_text_field($params['name'] ?? '');
    $phone_raw = preg_replace('/\D/', '', (string) ($params['phone'] ?? ''));
    $phone     = strlen($phone_raw) === 12 && str_starts_with($phone_raw, '91') ? substr($phone_raw, 2) : $phone_raw;
    $email     = sanitize_email($params['email'] ?? '');
    $programme = sanitize_text_field($params['programme'] ?? '');
    $message   = sanitize_textarea_field($params['message'] ?? '');

    $errors = [];
    if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
        $errors['name'] = 'Please enter your full name.';
    }
    if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
        $errors['phone'] = 'Please enter a valid 10-digit mobile number.';
    }
    if (!empty($params['email']) && !is_email($email)) {
        $errors['email'] = 'Please enter a valid email address.';
    }
    if (mb_strlen($programme) > 60) {
        $errors['programme'] = 'Please choose a programme.';
    }
    if (mb_strlen($message) > 1000) {
        $errors['message'] = 'Please keep the message under 1000 characters.';
    }
    if ($errors) {
        return new WP_REST_Response(['ok' => false, 'errors' => $errors], 400);
    }

    $ip_hash = hash('sha256', snc_enquiry_client_ip($req) . wp_salt('nonce'));
    $key = 'snc_enq_' . substr($ip_hash, 0, 32);
    $count = (int) get_transient($key);
    if ($count >= SNC_ENQUIRY_LIMIT) {
        return new WP_REST_Response(['ok' => false, 'errors' => ['form' => 'Too many submissions. Please try again later or call the college.']], 429);
    }
    set_transient($key, $count + 1, SNC_ENQUIRY_WINDOW);

    $post_id = wp_insert_post([
        'post_type'   => 'enquiry',
        'post_status' => 'private',
        'post_title'  => sprintf('%s — %s', $name, $phone),
        'meta_input'  => [
            'snc_phone'     => $phone,
            'snc_email'     => $email,
            'snc_programme' => $programme,
            'snc_message'   => $message,
            'snc_ip_hash'   => $ip_hash,
        ],
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['ok' => false, 'errors' => ['form' => 'Could not save the enquiry.']], 500);
    }

    $to = snc_get_settings()['email'] ?: get_option('admin_email');
    if ($to) {
        $body = "New admission enquiry from the website\n\nName: $name\nMobile: $phone\nEmail: $email\nProgramme: $programme\n\nMessage:\n$message\n\nView: " . admin_url("post.php?post=$post_id&action=edit");
        wp_mail($to, 'Website enquiry: ' . $name, $body, $email ? ['Reply-To: ' . $email] : []);
    }

    return new WP_REST_Response(['ok' => true], 201);
}
