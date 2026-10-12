<?php
/**
 * Seeder. Run with WP-CLI:   wp snc seed [--reset] [--samples] [--purge-samples] [--dry-run]
 * or without WP-CLI (local): php wp-content/plugins/snc-core-headless/seed/run.php [--reset] [--samples] [--purge-samples] [--dry-run]
 *
 *  --reset          Deletes ALL items of the SNC content types (and WP's default "Hello world!" / "Sample Page")
 *                   before seeding. Use on local/staging only.
 *  --samples        Also creates "[SAMPLE] …" notices, merit lists, documents, faculty, committees, news and photo albums for testing.
 *                   Never run on production.
 *  --purge-samples  Deletes only the "[SAMPLE] …" records and the files generated for them, and seeds
 *                   nothing. Real content entered in wp-admin is left alone. Run it as the college's
 *                   own content arrives. Cannot be combined with --samples.
 *  --dry-run        With --purge-samples, lists what would be deleted and deletes nothing.
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/content.php';

function snc_seed_cli(array $args, array $assoc): void {
    $log = fn($m) => WP_CLI::log($m);
    if (!empty($assoc['purge-samples'])) {
        if (!empty($assoc['samples'])) {
            WP_CLI::error('--purge-samples and --samples contradict each other.');
        }
        $dry_run = !empty($assoc['dry-run']);
        $count = snc_seed_purge_samples($log, $dry_run);
        WP_CLI::success($dry_run ? "Dry run: $count record(s) match." : "Purge complete: $count record(s) removed.");
        return;
    }
    snc_seed_run(!empty($assoc['reset']), !empty($assoc['samples']), $log);
    WP_CLI::success('Seed complete.');
}

function snc_seed_run(bool $reset, bool $samples, callable $log): void {
    snc_register_post_types();
    snc_register_taxonomies();
    snc_insert_default_terms();

    if ($reset) {
        snc_seed_reset($log);
    }

    // Settings: only fill empty values so manual edits are never overwritten.
    $current = get_option(SNC_SETTINGS_OPTION, []);
    $merged = snc_seed_settings();
    foreach ((array) $current as $key => $value) {
        if ($value !== '' && $value !== [] && $value !== 0 && $value !== false) {
            $merged[$key] = $value;
        }
    }
    update_option(SNC_SETTINGS_OPTION, snc_sanitize_settings($merged));
    $log('Settings saved.');

    foreach (snc_seed_programmes() as $p) {
        $id = snc_seed_upsert('programs', $p['slug'], $p['title'], $p['content'], ['post_excerpt' => $p['excerpt'], 'menu_order' => $p['order']]);
        foreach ($p['meta'] as $k => $v) {
            update_post_meta($id, $k, $v);
        }
        wp_set_object_terms($id, [$p['level']], 'program_level');
        wp_set_object_terms($id, [$p['programme']], 'programme');
        $log("Programme: {$p['title']}");
    }

    foreach (snc_seed_leaders() as $l) {
        $id = snc_seed_upsert('leader', sanitize_title($l['title']), $l['title'], $l['content'], ['post_excerpt' => $l['excerpt'], 'menu_order' => $l['order']]);
        update_post_meta($id, 'snc_designation', $l['designation']);
        $log("Leader: {$l['title']}");
    }

    foreach (snc_seed_committees() as $i => [$name, $purpose]) {
        snc_seed_upsert('committees', sanitize_title($name), $name, snc_b_p($purpose), ['menu_order' => $i + 1]);
    }
    $log('Committees: ' . count(snc_seed_committees()));

    foreach (snc_seed_pages() as $path => [$title, $subtitle, $content]) {
        $parts = explode('/', $path);
        $slug = array_pop($parts);
        $parent = $parts ? get_page_by_path(implode('/', $parts), OBJECT, 'page') : null;
        $existing = get_page_by_path($path, OBJECT, 'page');
        $data = [
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_title'   => $title,
            'post_name'    => $slug,
            'post_parent'  => $parent ? $parent->ID : 0,
            'post_content' => $content,
        ];
        if ($existing) {
            // WordPress's own unpublished default privacy page may be replaced.
            $wp_default_draft = (int) get_option('wp_page_for_privacy_policy') === $existing->ID && $existing->post_status === 'draft';
            // Never overwrite pages an editor has already changed.
            if (!$wp_default_draft && ((int) get_post_meta($existing->ID, '_snc_seeded', true) !== 1 || $existing->post_modified !== get_post_meta($existing->ID, '_snc_seeded_at', true))) {
                $log("Page kept (edited): /$path");
                continue;
            }
            $data['ID'] = $existing->ID;
        }
        $id = wp_insert_post(wp_slash($data), true);
        if (is_wp_error($id)) {
            $log("Page FAILED /$path: " . $id->get_error_message());
            continue;
        }
        update_post_meta($id, 'snc_hero_subtitle', $subtitle);
        update_post_meta($id, '_snc_seeded', 1);
        update_post_meta($id, '_snc_seeded_at', get_post($id)->post_modified);
        $log("Page: /$path");
    }

    if ($samples) {
        snc_seed_samples($log);
    }

    flush_rewrite_rules(false);
}

/** Insert or update a post identified by type + slug. Returns the post ID. */
function snc_seed_upsert(string $type, string $slug, string $title, string $content, array $extra = []): int {
    $existing = get_page_by_path($slug, OBJECT, $type);
    $data = array_merge([
        'post_type'    => $type,
        'post_status'  => 'publish',
        'post_title'   => $title,
        'post_name'    => $slug,
        'post_content' => $content,
    ], $extra);
    if ($existing) {
        $data['ID'] = $existing->ID;
    }
    return (int) wp_insert_post(wp_slash($data));
}

function snc_seed_reset(callable $log): void {
    $types = ['hero_slide', 'circulars', 'merit_lists', 'documents', 'programs', 'faculty_staff', 'committees', 'leader', 'gallery', 'testimonials', 'campus_life'];
    foreach ($types as $type) {
        $ids = get_posts(['post_type' => $type, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids']);
        foreach ($ids as $id) {
            wp_delete_post($id, true);
        }
        if ($ids) {
            $log("Reset: deleted " . count($ids) . " $type");
        }
    }
    foreach (['hello-world' => 'post', 'sample-page' => 'page'] as $slug => $type) {
        if ($p = get_page_by_path($slug, OBJECT, $type)) {
            wp_delete_post($p->ID, true);
            $log("Reset: deleted default $type '$slug'");
        }
    }
    // Sample attachments from earlier --samples runs.
    foreach (get_posts(['post_type' => 'attachment', 'posts_per_page' => -1, 's' => '[SAMPLE]', 'fields' => 'ids']) as $id) {
        wp_delete_attachment($id, true);
    }
    // Fake departments from the old seed.
    foreach (['arts-humanities', 'commerce', 'computer-it'] as $slug) {
        if ($t = get_term_by('slug', $slug, 'program_department')) {
            wp_delete_term($t->term_id, 'program_department');
            $log("Reset: deleted department term '$slug'");
        }
    }
    // Options written by the old plugin version.
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'snc\\_%' AND option_name NOT IN ('snc_settings','snc_core_version')");
}

/**
 * Delete every "[SAMPLE] …" record, and the PDFs and placeholder photos generated for them,
 * leaving every real record untouched. This is the tool for antigravity.md Phase C step 4:
 * samples are removed as the college's own content replaces them.
 *
 * Unlike --reset, which empties the content types completely, this matches on the "[SAMPLE]"
 * title prefix only, so content entered in wp-admin survives. Returns the number of records
 * matched (deleted, or that would be deleted under $dry_run).
 */
function snc_seed_purge_samples(callable $log, bool $dry_run = false): int {
    global $wpdb;

    snc_register_post_types();

    $types = ['hero_slide', 'circulars', 'merit_lists', 'documents', 'programs', 'faculty_staff', 'committees', 'leader', 'gallery', 'testimonials', 'campus_life', 'post', 'page'];
    $placeholders = implode(',', array_fill(0, count($types), '%s'));
    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT ID, post_type, post_title FROM {$wpdb->posts}
         WHERE post_type IN ($placeholders) AND post_title LIKE %s
         ORDER BY post_type, post_title",
        ...array_merge($types, [$wpdb->esc_like('[SAMPLE]') . '%'])
    ));
    // Sample PDFs and photos are titled after the record they belong to, so they carry the
    // prefix too; match anywhere in the title because some are suffixed ("… Order", "… photo 3").
    $attachments = array_map('intval', (array) $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_title LIKE %s ORDER BY post_title",
        '%' . $wpdb->esc_like('[SAMPLE]') . '%'
    )));

    if (!$rows && !$attachments) {
        $log('No [SAMPLE] records found. Nothing to purge.');
        return 0;
    }

    $by_type = [];
    foreach ($rows as $row) {
        $by_type[$row->post_type][] = $row;
    }
    foreach ($by_type as $type => $items) {
        $log(($dry_run ? 'Would purge: ' : 'Purging: ') . count($items) . " $type");
        if ($dry_run) {
            foreach ($items as $item) {
                $log("    #{$item->ID}  {$item->post_title}");
            }
        }
    }
    if ($attachments) {
        $log(($dry_run ? 'Would purge: ' : 'Purging: ') . count($attachments) . ' sample attachment(s) and their files');
    }

    if ($dry_run) {
        $log('Dry run — nothing was deleted.');
        return count($rows) + count($attachments);
    }

    // Queue the cache tags before deleting: the "deleted_post" hook cannot resolve the post
    // type once the row is gone, so a hard delete would otherwise leave the site cache stale.
    $tags = [];
    foreach (array_keys($by_type) as $type) {
        $tags = array_merge($tags, snc_tags_for_post_type($type));
    }
    if ($tags && function_exists('snc_queue_revalidate')) {
        snc_queue_revalidate($tags);
    }

    foreach ($rows as $row) {
        wp_delete_post((int) $row->ID, true);
    }
    foreach ($attachments as $id) {
        wp_delete_attachment($id, true);
    }
    $log('Purged ' . count($rows) . ' sample record(s) and ' . count($attachments) . ' attachment(s).');

    return count($rows) + count($attachments);
}

// ---------------------------------------------------------------------------------------------
// [SAMPLE] data for testing list pages. Every title starts with "[SAMPLE]".
// ---------------------------------------------------------------------------------------------

/** Create a tiny valid PDF attachment so file links and sizes can be tested. */
function snc_seed_sample_pdf(string $title): int {
    $existing = get_posts(['post_type' => 'attachment', 'title' => $title, 'posts_per_page' => 1, 'fields' => 'ids']);
    if ($existing) {
        return (int) $existing[0];
    }
    $text = str_replace(['(', ')', '\\'], '', $title);
    $stream = "BT /F1 18 Tf 72 720 Td ($text) Tj ET";
    $objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
        '<< /Length ' . strlen($stream) . " >>\nstream\n$stream\nendstream",
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    $pdf = "%PDF-1.4\n";
    $offsets = [];
    foreach ($objects as $i => $obj) {
        $offsets[] = strlen($pdf);
        $pdf .= ($i + 1) . " 0 obj\n$obj\nendobj\n";
    }
    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
    foreach ($offsets as $o) {
        $pdf .= sprintf("%010d 00000 n \n", $o);
    }
    $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n$xref\n%%EOF";

    $upload = wp_upload_bits(sanitize_file_name(strtolower($title)) . '.pdf', null, $pdf);
    if (!empty($upload['error'])) {
        return 0;
    }
    $id = wp_insert_attachment([
        'post_title'     => $title,
        'post_mime_type' => 'application/pdf',
        'post_status'    => 'inherit',
    ], $upload['file']);
    update_post_meta($id, '_wp_attachment_metadata', ['filesize' => filesize($upload['file'])]);
    return (int) $id;
}

/**
 * Create a flat placeholder JPEG attachment so the gallery grid and lightbox can be tested.
 * These are not photographs of anything; real images come from the college.
 */
function snc_seed_sample_photo(string $title, int $hue): int {
    $existing = get_posts(['post_type' => 'attachment', 'title' => $title, 'posts_per_page' => 1, 'fields' => 'ids']);
    if ($existing) {
        return (int) $existing[0];
    }
    if (!function_exists('imagecreatetruecolor')) {
        return 0;
    }
    [$w, $h] = [1200, 800];
    $img = imagecreatetruecolor($w, $h);
    // Two tones of one hue, so each album reads as a different set at a glance.
    $rgb = fn(float $l) => [
        (int) (127 + 110 * cos(deg2rad($hue))) * $l,
        (int) (127 + 110 * cos(deg2rad($hue + 120))) * $l,
        (int) (127 + 110 * cos(deg2rad($hue + 240))) * $l,
    ];
    [$r1, $g1, $b1] = array_map('intval', $rgb(0.55));
    [$r2, $g2, $b2] = array_map('intval', $rgb(0.85));
    imagefilledrectangle($img, 0, 0, $w, $h, imagecolorallocate($img, $r1, $g1, $b1));
    imagefilledrectangle($img, 0, (int) ($h * 0.62), $w, $h, imagecolorallocate($img, $r2, $g2, $b2));
    $white = imagecolorallocate($img, 255, 255, 255);
    imagestring($img, 5, 40, 40, $title, $white);
    imagestring($img, 3, 40, 70, 'Placeholder image - not a photograph of the college', $white);

    $upload = wp_upload_bits(sanitize_file_name(strtolower($title)) . '.jpg', null, '');
    if (!empty($upload['error'])) {
        imagedestroy($img);
        return 0;
    }
    imagejpeg($img, $upload['file'], 82);
    imagedestroy($img);

    $id = (int) wp_insert_attachment([
        'post_title'     => $title,
        'post_mime_type' => 'image/jpeg',
        'post_status'    => 'inherit',
    ], $upload['file']);
    if ($id) {
        wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $upload['file']));
        update_post_meta($id, '_wp_attachment_image_alt', $title);
    }
    return $id;
}

function snc_seed_samples(callable $log): void {
    $today = current_time('timestamp');
    $date = fn(int $daysAgo) => gmdate('Y-m-d H:i:s', $today - $daysAgo * DAY_IN_SECONDS);

    // Notices — enough rows to exercise the type tabs and pagination (20 per page).
    $notices = [
        ['UG Part I online admission schedule', 'admission', true],
        ['Fee deposit last date for admitted students', 'admission', true],
        ['Document verification schedule for admitted students', 'admission', false],
        ['PG admission enquiry notice', 'admission', false],
        ['Admission help desk timings', 'admission', false],
        ['Semester examination form filling dates', 'examination', false],
        ['Practical examination schedule for B.Sc.', 'examination', false],
        ['Examination admit card download notice', 'examination', false],
        ['Internal assessment test schedule', 'examination', false],
        ['Examination centre instructions for students', 'examination', false],
        ['Post-matric scholarship registration open', 'scholarship', false],
        ['Minority scholarship last date extended', 'scholarship', false],
        ['Tribal girls incentive scheme forms invited', 'scholarship', false],
        ['Scholarship document submission reminder', 'scholarship', false],
        ['Academic calendar for the session released', 'academic', false],
        ['Revised class time table', 'academic', false],
        ['Library book return notice before examinations', 'academic', false],
        ['Guest lecture series on research methods', 'academic', false],
        ['Attendance shortage warning notice', 'academic', false],
        ['NSS seven-day special camp', 'events', false],
        ['Annual sports week schedule', 'events', false],
        ['Independence Day celebration programme', 'events', false],
        ['Cultural programme audition notice', 'events', false],
        ['College closed on account of public holiday', 'general', false],
        ['Office timing change notice', 'general', false],
        ['Anti-ragging undertaking submission notice', 'general', false],
    ];
    foreach ($notices as $i => [$name, $type, $important]) {
        $title = "[SAMPLE] $name";
        $id = snc_seed_upsert('circulars', sanitize_title($title), $title, '', ['post_date' => $date(1 + $i * 3)]);
        update_post_meta($id, 'snc_document_id', snc_seed_sample_pdf($title));
        update_post_meta($id, 'snc_is_important', $important);
        wp_set_object_terms($id, [$type], 'circular_type');
    }
    $log('Samples: notices ' . count($notices));

    // Merit lists across sessions, programmes, types and categories
    $n = 0;
    foreach (['2026-27' => 5, '2025-26' => 370, '2024-25' => 735] as $year => $ago) {
        foreach (['ba' => 'B.A.', 'bsc' => 'B.Sc.'] as $prog => $progName) {
            foreach ([['merit', 'Merit List 1'], ['waiting', 'Waiting List 1']] as [$type, $typeName]) {
                foreach (['general' => 'General', 'obc' => 'OBC', 'sc' => 'SC', 'st' => 'ST', 'ews' => 'EWS'] as $cat => $catName) {
                    $title = "[SAMPLE] $progName Part I $typeName ($catName) $year";
                    $id = snc_seed_upsert('merit_lists', sanitize_title($title), $title, '', ['post_date' => $date($ago + $n % 4)]);
                    update_post_meta($id, 'snc_document_id', snc_seed_sample_pdf($title));
                    wp_set_object_terms($id, [$year], 'academic_year');
                    wp_set_object_terms($id, [$prog], 'programme');
                    wp_set_object_terms($id, [$type], 'list_type');
                    wp_set_object_terms($id, [$cat], 'merit_category');
                    $n++;
                }
            }
        }
    }
    $log("Samples: merit lists $n");

    // Documents
    $docs = [
        ['[SAMPLE] B.A. Semester I Syllabus 2026-27', 'syllabus', '2026-27', 'ba'],
        ['[SAMPLE] B.Sc. Semester I Syllabus 2026-27', 'syllabus', '2026-27', 'bsc'],
        ['[SAMPLE] B.A. Semester I Syllabus 2025-26', 'syllabus', '2025-26', 'ba'],
        ['[SAMPLE] B.Sc. Semester I Syllabus 2025-26', 'syllabus', '2025-26', 'bsc'],
        ['[SAMPLE] B.A. Question Papers 2025-26', 'question-paper', '2025-26', 'ba'],
        ['[SAMPLE] B.Sc. Question Papers 2025-26', 'question-paper', '2025-26', 'bsc'],
        ['[SAMPLE] B.A. Question Papers 2024-25', 'question-paper', '2024-25', 'ba'],
        ['[SAMPLE] Admission form', 'form', '2026-27', ''],
        ['[SAMPLE] Bonafide certificate request form', 'form', '2026-27', ''],
        ['[SAMPLE] Academic Calendar 2026-27', 'calendar', '2026-27', ''],
        ['[SAMPLE] Academic Calendar 2025-26', 'calendar', '2025-26', ''],
        ['[SAMPLE] Mandatory Disclosure', 'disclosure', '2026-27', ''],
        ['[SAMPLE] AQAR 2025-26', 'aqar', '2025-26', ''],
        ['[SAMPLE] AQAR 2024-25', 'aqar', '2024-25', ''],
        ['[SAMPLE] AISHE Report 2024-25', 'aishe', '2024-25', ''],
        ['[SAMPLE] Anti-ragging undertaking format', 'anti-ragging', '2026-27', ''],
    ];
    foreach ($docs as $i => [$title, $type, $year, $prog]) {
        $id = snc_seed_upsert('documents', sanitize_title($title), $title, '', ['post_date' => $date(2 + $i)]);
        update_post_meta($id, 'snc_document_id', snc_seed_sample_pdf($title));
        wp_set_object_terms($id, [$type], 'document_type');
        wp_set_object_terms($id, [$year], 'academic_year');
        if ($prog) {
            wp_set_object_terms($id, [$prog], 'programme');
        }
    }
    $log('Samples: documents ' . count($docs));

    // Faculty — enough people to exercise the department tabs and the four-column grid.
    $people = [
        ['[SAMPLE] Faculty One', 'Assistant Professor (Hindi)', 'M.A., B.Ed.', 'arts', 'teaching'],
        ['[SAMPLE] Faculty Two', 'Assistant Professor (Chemistry)', 'M.Sc., Ph.D.', 'science', 'teaching'],
        ['[SAMPLE] Faculty Three', 'Assistant Professor (Zoology)', 'M.Sc.', 'science', 'teaching'],
        ['[SAMPLE] Faculty Four', 'Assistant Professor (Political Science)', 'M.A., NET', 'arts', 'teaching'],
        ['[SAMPLE] Faculty Five', 'Assistant Professor (Geography)', 'M.A., M.Phil.', 'arts', 'teaching'],
        ['[SAMPLE] Faculty Six', 'Assistant Professor (Botany)', 'M.Sc.', 'science', 'teaching'],
        ['[SAMPLE] Faculty Seven', 'Librarian', 'M.Lib.I.Sc.', 'administration', 'teaching'],
        ['[SAMPLE] Staff One', 'Office Assistant', 'B.Com.', 'administration', 'non-teaching'],
        ['[SAMPLE] Staff Two', 'Laboratory Assistant', 'B.Sc.', 'science', 'non-teaching'],
        ['[SAMPLE] Staff Three', 'Accountant', 'B.Com., Tally', 'administration', 'non-teaching'],
    ];
    foreach ($people as $i => [$name, $desig, $qual, $dept, $staff]) {
        $id = snc_seed_upsert('faculty_staff', sanitize_title($name), $name, '', ['menu_order' => $i + 1]);
        update_post_meta($id, 'snc_designation', $desig);
        update_post_meta($id, 'snc_qualification', $qual);
        wp_set_object_terms($id, [$dept], 'program_department');
        wp_set_object_terms($id, [$staff], 'staff_type');
    }
    $log('Samples: faculty ' . count($people));

    // Reviews — layout only. REAL Google reviews must be copied in by hand, with the
    // reviewer's name as the title and the permalink in "Link to the original review";
    // the score and review count go in SNC Settings → Reviews. Never invent a review.
    $reviews = [
        ['[SAMPLE] Reviewer One', 'Sample review text used only to check the layout of the reviews section. Replace it with a real review from the Google listing.', 5, '2026-08-12', 'B.Sc., 2025'],
        ['[SAMPLE] Reviewer Two', 'Sample review text used only to check the layout of the reviews section. Replace it with a real review from the Google listing.', 4, '2026-06-02', 'B.A., 2024'],
        ['[SAMPLE] Reviewer Three', 'Sample review text used only to check the layout of the reviews section. Replace it with a real review from the Google listing.', 5, '2026-03-21', ''],
        ['[SAMPLE] Reviewer Four', 'Sample review text used only to check the layout of the reviews section. Replace it with a real review from the Google listing.', 4, '2025-12-09', ''],
    ];
    foreach ($reviews as $i => [$name, $quote, $rating, $on, $batch]) {
        $id = snc_seed_upsert('testimonials', sanitize_title($name), $name, snc_b_p($quote), ['menu_order' => $i + 1]);
        update_post_meta($id, 'snc_source', 'google');
        update_post_meta($id, 'snc_rating', (string) $rating);
        update_post_meta($id, 'snc_review_date', $on);
        update_post_meta($id, 'snc_programme_batch', $batch);
        update_post_meta($id, 'snc_consent', true);
    }
    $log('Samples: reviews ' . count($reviews));

    // Committees with a session, convener, members and an order PDF, so the session selector
    // and the members table can be tested. The real committees seeded above carry no session,
    // because the college has not told us which session they belong to.
    $members = function (array $names): string {
        $rows = [];
        foreach ($names as [$name, $designation, $role]) {
            $rows[] = ['name' => $name, 'designation' => $designation, 'role' => $role];
        }
        return wp_json_encode($rows);
    };
    $committees = [
        ['2026-27', 'Internal Quality Assurance Cell (IQAC)', 'Co-ordinator, IQAC', [
            ['[SAMPLE] Member One', 'Principal', 'Chairperson'],
            ['[SAMPLE] Member Two', 'Assistant Professor (Hindi)', 'Co-ordinator'],
            ['[SAMPLE] Member Three', 'Assistant Professor (Chemistry)', 'Member'],
            ['[SAMPLE] Member Four', 'Assistant Professor (Zoology)', 'Member'],
            ['[SAMPLE] Member Five', 'Office Assistant', 'Member (administration)'],
            ['[SAMPLE] Member Six', 'Student representative', 'Member'],
            ['[SAMPLE] Member Seven', 'Local resident', 'External member'],
        ]],
        ['2026-27', 'Admission Committee', 'Convener, Admission Committee', [
            ['[SAMPLE] Member One', 'Principal', 'Chairperson'],
            ['[SAMPLE] Member Two', 'Assistant Professor (Hindi)', 'Convener'],
            ['[SAMPLE] Member Three', 'Office Assistant', 'Member'],
        ]],
        ['2025-26', 'Internal Quality Assurance Cell (IQAC)', 'Co-ordinator, IQAC', [
            ['[SAMPLE] Member One', 'Principal', 'Chairperson'],
            ['[SAMPLE] Member Two', 'Assistant Professor (Chemistry)', 'Co-ordinator'],
            ['[SAMPLE] Member Three', 'Assistant Professor (Zoology)', 'Member'],
        ]],
        ['2025-26', 'Admission Committee', 'Convener, Admission Committee', [
            ['[SAMPLE] Member One', 'Principal', 'Chairperson'],
            ['[SAMPLE] Member Two', 'Assistant Professor (Hindi)', 'Convener'],
        ]],
    ];
    foreach ($committees as $i => [$year, $name, $convener, $roster]) {
        $title = "[SAMPLE] $name $year";
        $id = snc_seed_upsert('committees', sanitize_title($title), $title, snc_b_p('Sample committee record used only to test the committees page. Replace it with the committee order issued by the college.'), ['menu_order' => $i + 1]);
        update_post_meta($id, 'snc_convener', $convener);
        update_post_meta($id, 'snc_members_json', $members($roster));
        update_post_meta($id, 'snc_order_document_id', snc_seed_sample_pdf("$title Order"));
        wp_set_object_terms($id, [$year], 'academic_year');
    }
    $log('Samples: committees ' . count($committees));

    // News — enough items across the three categories to exercise the tabs and the pager (12 per page).
    $news = [
        ['Annual sports week concludes', 'events', 6],
        ['Guest lecture on career planning', 'news', 12],
        ['Press note: NSS cleanliness drive', 'press-notes', 25],
        ['NSS special camp inaugurated in the village', 'events', 31],
        ['Independence Day celebrated on campus', 'events', 44],
        ['Inter-college debate competition held', 'events', 58],
        ['College wins district-level kabaddi tournament', 'news', 66],
        ['New computer laboratory equipment installed', 'news', 73],
        ['Career counselling workshop for final-year students', 'news', 88],
        ['Tree plantation drive on World Environment Day', 'events', 95],
        ['Press note: college results announced', 'press-notes', 110],
        ['Scholarship awareness camp for students', 'news', 124],
        ['Press note: admission schedule released', 'press-notes', 139],
        ['Republic Day programme at the college', 'events', 152],
        ['Workshop on digital literacy conducted', 'news', 167],
    ];
    foreach ($news as [$name, $cat, $ago]) {
        $title = "[SAMPLE] $name";
        $id = snc_seed_upsert('post', sanitize_title($title), $title,
            snc_b_p('Sample news text used only to test the news layout. Replace with real news from the college.')
            . snc_b_p('A second paragraph so the article page has enough text to show the reading measure and the prose styles.'),
            ['post_date' => $date($ago)]);
        wp_set_object_terms($id, [$cat], 'category');
    }
    $log('Samples: news ' . count($news));

    // Photo albums — generated placeholder images so the album grid and the lightbox can be tested.
    $albums = [
        ['Annual Function', 6, 8],
        ['NSS Special Camp', 40, 6],
        ['Sports Day', 80, 5],
        ['Campus and Laboratories', 120, 4],
    ];
    foreach ($albums as $i => [$name, $ago, $count]) {
        $title = "[SAMPLE] $name";
        $id = snc_seed_upsert('gallery', sanitize_title($title), $title,
            snc_b_p('Sample album used only to test the gallery. Replace it with real photographs from the college.'),
            ['post_date' => $date($ago)]);
        $photo_ids = [];
        for ($n = 1; $n <= $count; $n++) {
            $photo_ids[] = snc_seed_sample_photo("$title photo $n", $i * 60 + $n * 17);
        }
        $photo_ids = array_values(array_filter($photo_ids));
        update_post_meta($id, 'snc_photo_ids', implode(',', $photo_ids));
        if ($photo_ids && !has_post_thumbnail($id)) {
            set_post_thumbnail($id, $photo_ids[0]);
        }
    }
    $log('Samples: photo albums ' . count($albums));
}
