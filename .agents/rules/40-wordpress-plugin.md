---
trigger: glob
globs: wp-content/plugins/snc-core-headless/**/*.php,wp-content/plugins/snc-core-headless/**/*.js,wp-content/plugins/snc-core-headless/**/*.css
description: Conventions for the snc-core-headless WordPress plugin — the field registry, serializers, REST contract, seeding and the local environment.
---

# The `snc-core-headless` plugin

WordPress is an admin and an API. Its public theme is not used; the plugin redirects
non-admin, non-REST, non-media requests to the Next.js site.

## Never touch

WordPress core: `wp-admin/`, `wp-includes/`, and the root `wp-*.php` files (except
`wp-config.php`, which holds `SNC_FRONTEND_URL` and `SNC_REVALIDATE_SECRET`).

## How a field works

There is **one field registry**, `includes/meta.php`. Adding a line there registers the meta,
renders the admin input and sanitises the value. Do not hand-roll a meta box.

Input types: `text`, `textarea`, `lines`, `url`, `email`, `checkbox`, `select` (with
`options`), `image`, `file`, `gallery`, `members`. Attachments are stored as **attachment
IDs**, never pasted URLs, so size, MIME and alt text can be resolved.

Site-wide settings are one option, `snc_settings`, defined by `snc_settings_schema()` in
`includes/settings.php`.

Adding a field end to end touches four files — use the `cms-field` skill, which lists them
in order.

## REST

- Namespace `snc/v1`. Routes in `includes/rest/routes.php`, shapes in
  `includes/rest/serializers.php`.
- The response shape is a **contract** with `frontend/lib/wp/types.ts`. Change both together.
- Responses are normalised: no `_embed`, no `rendered` wrappers, nulls for missing images.
- Custom post types are not exposed in `/wp/v2` (`show_in_rest` is false). The frontend uses
  `snc/v1` only.
- Saving content POSTs cache tags to the frontend's `/api/revalidate` (`includes/revalidate.php`).
  A new content type needs an entry in the tag map, or edits will not appear on the site.

## Local environment

- WordPress runs on Laragon's PHP built-in server at `http://localhost:8881`, **plain
  permalinks**, MySQL database `snc_db`. The built-in server is single-threaded, so a
  Next.js production build competing with a dev server can time out — stop the dev server
  before `npm run build` if prerendering stalls.
- PHP binary: `C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe`.
- Syntax check every file you edit: `php -l <file>`.
- `WP_DEBUG_DISPLAY` is **false** on purpose. PHP notices printed into a response corrupt the
  JSON and produce confusing frontend errors.

## Seeding

`php wp-content/plugins/snc-core-headless/seed/run.php [--reset] [--samples]`

- Real, verified content lives in `seed/content.php`.
- Unverified test data lives in `snc_seed_samples()` and every title starts with `[SAMPLE]`.
  Never put unverified content in `seed/content.php`.
- The seed does not overwrite a page an editor has changed.
- **Production is seeded without `--samples`.**

## Removing the samples

`php wp-content/plugins/snc-core-headless/seed/run.php --purge-samples [--dry-run]`

Deletes only the `[SAMPLE] …` records and the PDFs and placeholder photos generated for
them, and seeds nothing. Content entered in wp-admin survives, so this is the command to run
as the college's own content replaces the samples — **not** `--reset`, which empties the
content types completely. Always `--dry-run` first and read the list. The purge queues the
affected cache tags itself, because WordPress's `deleted_post` hook cannot resolve a post
type once the row is gone.

## Before finishing

`php -l` each changed file, then curl the affected endpoints and check the JSON shape against
`frontend/lib/wp/types.ts`. Back up the database before anything destructive:
`mysqldump` to a file outside the repository.
