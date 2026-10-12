<?php
/**
 * Site settings storage (Plan B4 "Site settings"). Stored as one option: snc_settings.
 */

if (!defined('ABSPATH')) {
    exit;
}

const SNC_SETTINGS_OPTION = 'snc_settings';

/** Icon keys the frontend knows how to render (WhyIconKey in lib/wp/types.ts). */
function snc_why_icons(): array {
    return [
        'graduation-cap' => 'Graduation cap',
        'flask-conical'  => 'Science flask',
        'library'        => 'Library',
        'wifi'           => 'Wi-Fi / computers',
        'hand-coins'     => 'Scholarship',
        'briefcase'      => 'Career / placement',
        'users'          => 'People / community',
        'shield-check'   => 'Safety / discipline',
    ];
}

/** Field schema: key => [section, label, input, desc]. Order = order on the settings page. */
function snc_settings_schema(): array {
    return [
        'college_name'   => ['identity', 'College name', 'text', ''],
        'logo_id'        => ['identity', 'College logo', 'image', 'Square, transparent PNG or SVG. Shown in the header, the menu drawer and the footer. Leave empty to use the logo bundled with the website.'],
        'hindi_name'     => ['identity', 'College name in Hindi', 'text', 'Shown in the footer.'],
        'short_about'    => ['identity', 'Short description', 'textarea', 'Footer text, max ~45 words.'],
        'affiliation'    => ['identity', 'Affiliating university', 'text', 'Shown on programme pages, e.g. Govind Guru Tribal University (GGTU), Banswara.'],
        'phone_admission' => ['contact', 'Admission phone', 'text', 'e.g. +91 94143 52319'],
        'phone_office'   => ['contact', 'Office phone', 'text', ''],
        'whatsapp'       => ['contact', 'WhatsApp number', 'text', '10-digit mobile number or with country code.'],
        'email'          => ['contact', 'Email', 'email', 'Also receives website enquiries.'],
        'address'        => ['contact', 'Address', 'textarea', ''],
        'map_link'       => ['contact', 'Google Maps link', 'url', 'The "Share → Copy link" URL of the college location.'],
        'map_embed_url'  => ['contact', 'Google Maps embed URL', 'url', 'From "Share → Embed a map": copy only the src="…" URL.'],
        'office_hours'   => ['contact', 'Office hours', 'text', 'e.g. Monday to Saturday, 10:00 am – 4:00 pm'],
        'facebook'       => ['social', 'Facebook URL', 'url', ''],
        'instagram'      => ['social', 'Instagram URL', 'url', ''],
        'youtube'        => ['social', 'YouTube URL', 'url', ''],
        'session_label'  => ['admission', 'Current admission session', 'text', 'e.g. 2026-27'],
        'admission_open' => ['admission', 'Admissions are open', 'checkbox', ''],
        'apply_url'      => ['admission', 'Apply Now link', 'url', 'Online admission form. Leave empty to use the "How to Apply" page.'],
        'about_eyebrow'  => ['home', 'About section: small label', 'text', 'e.g. About SNC'],
        'about_heading'  => ['home', 'About section: heading', 'text', ''],
        'about_body'     => ['home', 'About section: text', 'textarea', 'Two short paragraphs. Separate paragraphs with a blank line.'],
        'about_image_id' => ['home', 'About section: photo', 'image', 'Real campus photo.'],
        'why_items'      => ['home', 'Why choose SNC (6 items)', 'why', ''],
        'facts'          => ['home', 'Key facts (up to 4)', 'facts', 'Only facts the college can verify.'],
        'cta_heading'    => ['home', 'Admission banner: heading', 'text', ''],
        'cta_text'       => ['home', 'Admission banner: text', 'textarea', ''],
        'cta_image_id'   => ['home', 'Admission banner: background photo', 'image', ''],
        'google_rating'        => ['reviews', 'Google rating', 'text', 'The score shown on the Google listing, e.g. 4.2. Leave empty to hide the whole reviews section.'],
        'google_review_count'  => ['reviews', 'Number of Google reviews', 'text', 'e.g. 87. Shown under the score.'],
        'google_reviews_url'   => ['reviews', 'Link to the Google listing', 'url', 'The "Share" link of the college on Google Maps, so visitors can read and leave reviews.'],
        'default_og_image_id' => ['seo', 'Default share image', 'image', '1200 × 630 px, used when a page has no featured image.'],
    ];
}

function snc_settings_sections(): array {
    return [
        'identity'  => 'College identity',
        'contact'   => 'Contact details',
        'social'    => 'Social media',
        'admission' => 'Admissions',
        'home'      => 'Homepage',
        'reviews'   => 'Reviews',
        'seo'       => 'Search & sharing',
    ];
}

function snc_settings_defaults(): array {
    $defaults = [];
    foreach (snc_settings_schema() as $key => [, , $input]) {
        $defaults[$key] = match ($input) {
            'checkbox'       => false,
            'image'          => 0,
            'why', 'facts'   => [],
            default          => '',
        };
    }
    return $defaults;
}

function snc_get_settings(): array {
    $stored = get_option(SNC_SETTINGS_OPTION, []);
    return array_merge(snc_settings_defaults(), is_array($stored) ? $stored : []);
}

/** Sanitise a full settings array (used by the settings page and the seed). */
function snc_sanitize_settings(array $input): array {
    $out = snc_settings_defaults();
    foreach (snc_settings_schema() as $key => [, , $type]) {
        $value = $input[$key] ?? null;
        switch ($type) {
            case 'why':
                $rows = [];
                $icons = snc_why_icons();
                foreach ((array) $value as $row) {
                    $title = sanitize_text_field($row['title'] ?? '');
                    if ($title === '') {
                        continue;
                    }
                    $icon = $row['icon'] ?? '';
                    $rows[] = [
                        'icon'  => isset($icons[$icon]) ? $icon : 'graduation-cap',
                        'title' => $title,
                        'text'  => sanitize_text_field($row['text'] ?? ''),
                    ];
                }
                $out[$key] = array_slice($rows, 0, 6);
                break;
            case 'facts':
                $rows = [];
                foreach ((array) $value as $row) {
                    $v = sanitize_text_field($row['value'] ?? '');
                    $l = sanitize_text_field($row['label'] ?? '');
                    if ($v !== '' && $l !== '') {
                        $rows[] = ['value' => $v, 'label' => $l];
                    }
                }
                $out[$key] = array_slice($rows, 0, 4);
                break;
            case 'checkbox':
                $out[$key] = !empty($value);
                break;
            case 'image':
                $out[$key] = absint($value);
                break;
            default:
                $out[$key] = $value === null ? '' : snc_sanitize_field_value($type, $value);
        }
    }
    return $out;
}
