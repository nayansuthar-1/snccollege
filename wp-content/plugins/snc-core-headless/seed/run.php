<?php
/**
 * CLI runner for environments without WP-CLI:
 *   php wp-content/plugins/snc-core-headless/seed/run.php [--reset] [--samples]
 *   php wp-content/plugins/snc-core-headless/seed/run.php --purge-samples [--dry-run]
 *
 * See seed.php for what each flag does.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only.');
}

$root = dirname(__DIR__, 4);
$_SERVER['HTTP_HOST'] = $_SERVER['HTTP_HOST'] ?? 'localhost';
require $root . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once __DIR__ . '/seed.php';

$args = array_slice($argv, 1);
$has = fn(string $flag) => in_array($flag, $args, true);
$log = function (string $m) {
    fwrite(STDOUT, $m . PHP_EOL);
};
wp_set_current_user((int) (get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID'])[0] ?? 0));

if ($has('--purge-samples')) {
    if ($has('--samples')) {
        fwrite(STDERR, '--purge-samples and --samples contradict each other.' . PHP_EOL);
        exit(1);
    }
    $dry_run = $has('--dry-run');
    $count = snc_seed_purge_samples($log, $dry_run);
    fwrite(STDOUT, ($dry_run ? "Dry run: $count record(s) match." : "Purge complete: $count record(s) removed.") . PHP_EOL);
    exit(0);
}

snc_seed_run($has('--reset'), $has('--samples'), $log);
fwrite(STDOUT, "Seed complete." . PHP_EOL);
