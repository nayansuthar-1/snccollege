<?php
/**
 * Serialisers: WordPress objects → the JSON shapes in Plan B5 / frontend lib/wp/types.ts.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Img = { url, width, height, alt } */
function snc_img(int $attachment_id, string $size = 'full'): ?array {
    if ($attachment_id <= 0 || !wp_attachment_is_image($attachment_id)) {
        return null;
    }
    $src = wp_get_attachment_image_src($attachment_id, $size);
    if (!$src) {
        return null;
    }
    return [
        'url'    => $src[0],
        'width'  => (int) $src[1],
        'height' => (int) $src[2],
        'alt'    => (string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
    ];
}

/** Gallery image adds the caption into alt when alt is empty. */
function snc_gallery_img(int $attachment_id): ?array {
    $img = snc_img($attachment_id, 'large');
    if ($img && $img['alt'] === '') {
        $img['alt'] = wp_get_attachment_caption($attachment_id) ?: '';
    }
    return $img;
}

/** File = { url, mime, size_bytes, filename } */
function snc_file(int $attachment_id): ?array {
    if ($attachment_id <= 0 || get_post_type($attachment_id) !== 'attachment') {
        return null;
    }
    $url = wp_get_attachment_url($attachment_id);
    if (!$url) {
        return null;
    }
    $path = get_attached_file($attachment_id);
    $meta = wp_get_attachment_metadata($attachment_id);
    $size = (int) ($meta['filesize'] ?? 0);
    if ($size === 0 && $path && file_exists($path)) {
        $size = (int) filesize($path);
    }
    return [
        'url'        => $url,
        'mime'       => (string) get_post_mime_type($attachment_id),
        'size_bytes' => $size,
        'filename'   => $path ? wp_basename($path) : wp_basename($url),
    ];
}

/** Term = { slug, name } — first term of a taxonomy on a post. */
function snc_term(int $post_id, string $taxonomy): ?array {
    $terms = get_the_terms($post_id, $taxonomy);
    if (!$terms || is_wp_error($terms)) {
        return null;
    }
    return ['slug' => $terms[0]->slug, 'name' => $terms[0]->name];
}

/** Terms of a taxonomy that are in use, optionally sorted descending (sessions). */
function snc_terms_in_use(string $taxonomy, bool $desc = false): array {
    $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => true, 'orderby' => 'name', 'order' => $desc ? 'DESC' : 'ASC']);
    if (is_wp_error($terms)) {
        return [];
    }
    // hide_empty on hierarchical taxonomies leaves gaps in keys — re-index so JSON stays an array.
    return array_values(array_map(fn($t) => ['slug' => $t->slug, 'name' => $t->name], $terms));
}

function snc_meta(int $post_id, string $key): string {
    return (string) get_post_meta($post_id, $key, true);
}

function snc_lines(int $post_id, string $key): array {
    return array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', snc_meta($post_id, $key)))));
}

function snc_date(WP_Post $post): string {
    return get_post_time('Y-m-d', false, $post);
}

function snc_content_html(WP_Post $post): string {
    return (string) apply_filters('the_content', $post->post_content);
}

function snc_excerpt(WP_Post $post, int $words = 30): string {
    $text = $post->post_excerpt !== '' ? $post->post_excerpt : wp_strip_all_tags(strip_shortcodes($post->post_content));
    return wp_trim_words(html_entity_decode($text, ENT_QUOTES), $words, '…');
}

function snc_title(WP_Post $post): string {
    return html_entity_decode(get_the_title($post), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function snc_link_or_null(string $label, string $url): ?array {
    return ($label !== '' && $url !== '') ? ['label' => $label, 'url' => $url] : null;
}

// ---------------------------------------------------------------------------
// Per-type serialisers
// ---------------------------------------------------------------------------

function snc_serialize_settings(): array {
    $s = snc_get_settings();
    return [
        'college_name'     => $s['college_name'],
        // null → the frontend falls back to the logo bundled in public/images/logo.png.
        'logo'             => snc_img((int) $s['logo_id'], 'large'),
        'hindi_name'       => $s['hindi_name'],
        'short_about'      => $s['short_about'],
        'affiliation'      => $s['affiliation'],
        'phone_admission'  => $s['phone_admission'],
        'phone_office'     => $s['phone_office'],
        'email'            => $s['email'],
        'address'          => $s['address'],
        'map_embed_url'    => $s['map_embed_url'],
        'map_link'         => $s['map_link'],
        'office_hours'     => $s['office_hours'],
        'whatsapp'         => $s['whatsapp'],
        'facebook'         => $s['facebook'],
        'instagram'        => $s['instagram'],
        'youtube'          => $s['youtube'],
        'session_label'    => $s['session_label'],
        'admission_open'   => (bool) $s['admission_open'],
        'apply_url'        => $s['apply_url'],
        'about_eyebrow'    => $s['about_eyebrow'],
        'about_heading'    => $s['about_heading'],
        'about_body'       => $s['about_body'],
        'about_image'      => snc_img((int) $s['about_image_id'], 'large'),
        'why_items'        => array_values($s['why_items']),
        'facts'            => array_values($s['facts']),
        'cta_heading'      => $s['cta_heading'],
        'cta_text'         => $s['cta_text'],
        'cta_image'        => snc_img((int) $s['cta_image_id']),
        'google_rating'       => $s['google_rating'],
        'google_review_count' => $s['google_review_count'],
        'google_reviews_url'  => $s['google_reviews_url'],
        'default_og_image' => snc_img((int) $s['default_og_image_id']),
    ];
}

function snc_serialize_slide(WP_Post $p): ?array {
    $desktop = snc_img((int) get_post_meta($p->ID, 'snc_image_desktop', true));
    if (!$desktop) {
        return null; // a slide without its required image is skipped
    }
    return [
        'id'            => $p->ID,
        'image_desktop' => $desktop,
        'image_mobile'  => snc_img((int) get_post_meta($p->ID, 'snc_image_mobile', true)),
        'eyebrow'       => snc_meta($p->ID, 'snc_eyebrow'),
        'heading'       => snc_meta($p->ID, 'snc_heading'),
        'subtext'       => snc_meta($p->ID, 'snc_subtext'),
        'cta1'          => snc_link_or_null(snc_meta($p->ID, 'snc_cta1_label'), snc_meta($p->ID, 'snc_cta1_url')),
        'cta2'          => snc_link_or_null(snc_meta($p->ID, 'snc_cta2_label'), snc_meta($p->ID, 'snc_cta2_url')),
        'link_url'      => snc_meta($p->ID, 'snc_link_url'),
    ];
}

function snc_serialize_notice(WP_Post $p): array {
    return [
        'id'        => $p->ID,
        'title'     => snc_title($p),
        'slug'      => $p->post_name,
        'date'      => snc_date($p),
        'type'      => snc_term($p->ID, 'circular_type'),
        'important' => (bool) get_post_meta($p->ID, 'snc_is_important', true),
        'file'      => snc_file((int) get_post_meta($p->ID, 'snc_document_id', true)),
        'url'       => snc_meta($p->ID, 'snc_external_url'),
    ];
}

function snc_serialize_merit_list(WP_Post $p): array {
    return [
        'id'        => $p->ID,
        'title'     => snc_title($p),
        'date'      => snc_date($p),
        'year'      => snc_term($p->ID, 'academic_year'),
        'programme' => snc_term($p->ID, 'programme'),
        'list_type' => snc_term($p->ID, 'list_type'),
        'category'  => snc_term($p->ID, 'merit_category'),
        'file'      => snc_file((int) get_post_meta($p->ID, 'snc_document_id', true)),
    ];
}

function snc_serialize_document(WP_Post $p): array {
    return [
        'id'        => $p->ID,
        'title'     => snc_title($p),
        'date'      => snc_date($p),
        'type'      => snc_term($p->ID, 'document_type'),
        'year'      => snc_term($p->ID, 'academic_year'),
        'programme' => snc_term($p->ID, 'programme'),
        'file'      => snc_file((int) get_post_meta($p->ID, 'snc_document_id', true)),
        'url'       => snc_meta($p->ID, 'snc_external_url'),
    ];
}

function snc_serialize_programme_summary(WP_Post $p): array {
    return [
        'id'         => $p->ID,
        'slug'       => $p->post_name,
        'title'      => snc_title($p),
        'short_name' => snc_meta($p->ID, 'snc_short_name'),
        'level'      => snc_term($p->ID, 'program_level'),
        'excerpt'    => snc_excerpt($p, 35),
        'duration'   => snc_meta($p->ID, 'snc_duration'),
        'pattern'    => snc_meta($p->ID, 'snc_pattern'),
        'subjects'   => snc_lines($p->ID, 'snc_subjects'),
        'image'      => snc_img((int) get_post_thumbnail_id($p), 'large'),
    ];
}

function snc_serialize_programme(WP_Post $p): array {
    return snc_serialize_programme_summary($p) + [
        'content_html' => snc_content_html($p),
        'eligibility'  => snc_meta($p->ID, 'snc_eligibility'),
        'career_paths' => snc_lines($p->ID, 'snc_career_paths'),
        'syllabus'     => snc_file((int) get_post_meta($p->ID, 'snc_syllabus_document_id', true)),
        'intake'       => snc_meta($p->ID, 'snc_intake'),
        'fee_note'     => snc_meta($p->ID, 'snc_fee_note'),
    ];
}

function snc_serialize_person(WP_Post $p): array {
    $public = (bool) get_post_meta($p->ID, 'snc_public_contact', true);
    return [
        'id'            => $p->ID,
        'name'          => snc_title($p),
        'designation'   => snc_meta($p->ID, 'snc_designation'),
        'qualification' => snc_meta($p->ID, 'snc_qualification'),
        'experience'    => snc_meta($p->ID, 'snc_experience'),
        'department'    => snc_term($p->ID, 'program_department'),
        'staff_type'    => snc_term($p->ID, 'staff_type'),
        'email'         => $public ? snc_meta($p->ID, 'snc_email') : '',
        'photo'         => snc_img((int) get_post_thumbnail_id($p), 'medium'),
    ];
}

function snc_serialize_committee(WP_Post $p): array {
    $members = json_decode(snc_meta($p->ID, 'snc_members_json'), true);
    return [
        'id'             => $p->ID,
        'title'          => snc_title($p),
        'purpose_html'   => snc_content_html($p),
        'convener'       => snc_meta($p->ID, 'snc_convener'),
        'members'        => is_array($members) ? array_values($members) : [],
        'order_document' => snc_file((int) get_post_meta($p->ID, 'snc_order_document_id', true)),
        'year'           => snc_term($p->ID, 'academic_year'),
    ];
}

function snc_serialize_leader(WP_Post $p): array {
    return [
        'id'           => $p->ID,
        'name'         => snc_title($p),
        'designation'  => snc_meta($p->ID, 'snc_designation'),
        'excerpt'      => $p->post_excerpt !== '' ? wp_strip_all_tags($p->post_excerpt) : snc_excerpt($p, 60),
        'content_html' => snc_content_html($p),
        'photo'        => snc_img((int) get_post_thumbnail_id($p), 'large'),
    ];
}

function snc_album_photo_ids(int $post_id): array {
    return array_values(array_filter(array_map('absint', explode(',', snc_meta($post_id, 'snc_photo_ids')))));
}

function snc_serialize_album_summary(WP_Post $p): array {
    $ids = snc_album_photo_ids($p->ID);
    $cover_id = (int) get_post_thumbnail_id($p) ?: ($ids[0] ?? 0);
    return [
        'id'          => $p->ID,
        'slug'        => $p->post_name,
        'title'       => snc_title($p),
        'date'        => snc_date($p),
        'cover'       => snc_img($cover_id, 'large'),
        'photo_count' => count($ids),
    ];
}

function snc_serialize_album(WP_Post $p): array {
    return snc_serialize_album_summary($p) + [
        'content_html' => snc_content_html($p),
        'photos'       => array_values(array_filter(array_map('snc_gallery_img', snc_album_photo_ids($p->ID)))),
    ];
}

function snc_serialize_news_summary(WP_Post $p): array {
    $cat = null;
    foreach ((array) get_the_category($p->ID) as $c) {
        if ($c->slug !== 'uncategorized') {
            $cat = ['slug' => $c->slug, 'name' => $c->name];
            break;
        }
    }
    return [
        'id'       => $p->ID,
        'slug'     => $p->post_name,
        'title'    => snc_title($p),
        'date'     => snc_date($p),
        'excerpt'  => snc_excerpt($p, 28),
        'category' => $cat,
        'image'    => snc_img((int) get_post_thumbnail_id($p), 'large'),
    ];
}

function snc_serialize_news(WP_Post $p): array {
    $gallery = [];
    foreach (get_attached_media('image', $p->ID) as $att) {
        if ((int) $att->ID !== (int) get_post_thumbnail_id($p) && ($img = snc_gallery_img($att->ID))) {
            $gallery[] = $img;
        }
    }
    return snc_serialize_news_summary($p) + ['content_html' => snc_content_html($p), 'gallery' => $gallery];
}

function snc_serialize_testimonial(WP_Post $p): array {
    $rating = (int) snc_meta($p->ID, 'snc_rating');
    return [
        'id'              => $p->ID,
        'name'            => snc_title($p),
        'quote'           => wp_strip_all_tags($p->post_content),
        'programme_batch' => snc_meta($p->ID, 'snc_programme_batch'),
        'photo'           => snc_img((int) get_post_thumbnail_id($p), 'thumbnail'),
        'source'          => snc_meta($p->ID, 'snc_source') === 'google' ? 'google' : 'college',
        'rating'          => ($rating >= 1 && $rating <= 5) ? $rating : null,
        'review_url'      => snc_meta($p->ID, 'snc_review_url'),
        'date'            => snc_meta($p->ID, 'snc_review_date'),
    ];
}

function snc_serialize_page(WP_Post $p): array {
    return [
        'id'           => $p->ID,
        'title'        => snc_title($p),
        'path'         => get_page_uri($p),
        'subtitle'     => snc_meta($p->ID, 'snc_hero_subtitle'),
        'content_html' => snc_content_html($p),
        'excerpt'      => snc_excerpt($p, 30),
        'hero_image'   => snc_img((int) get_post_thumbnail_id($p)),
        'updated_at'   => get_post_modified_time('Y-m-d', false, $p),
    ];
}
