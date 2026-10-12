# SNC College website — operations runbook

**For:** whoever maintains the site after handover — the college's IT coordinator and any
developer who takes it over.
**Version:** 1.0 (12 October 2026)

This is the technical companion to `CMS-HANDOVER-GUIDE.md`, which covers the day-to-day
publishing jobs. This document covers everything else: what the system is made of, how to
back it up and restore it, how to add a user, and what to do when something breaks.

> Items marked **[TO BE FILLED]** need a fact only the college or the owner can supply. They
> are listed as open items in `BLOCKERS.md` at the repository root. Do not guess them.

---

## 1. What the system is

Two separate applications:

| Part | What it is | Where it runs |
|---|---|---|
| **Website** | Next.js 16.4.0 / React 19.3.0, server-rendered | `snccollegedpr.in` |
| **CMS** | WordPress 7.1.3 on PHP 8.3, MySQL database `snc_db` | `cms.snccollegedpr.in` |

Visitors only ever see the Next.js site. WordPress is an editing screen and a JSON API; its
own public theme is switched off and every non-admin, non-API request to it is redirected to
the website. The CMS must serve `X-Robots-Tag: noindex` so Google never lists it.

All the custom behaviour lives in **one plugin**, `snc-core-headless` (v2.0.0), at
`wp-content/plugins/snc-core-headless/`. WordPress core is untouched; so is everything in
`wp-admin/`, `wp-includes/` and the root `wp-*.php` files except `wp-config.php`.

### Where the code lives

```
frontend/                                    the Next.js website
  app/                                       pages and routes
  components/                                UI components
  lib/wp/                                    the WordPress API client and its types
  config/                                    navigation and site config
  next.config.ts                             legacy redirects and image hosts
wp-content/plugins/snc-core-headless/
  includes/meta.php                          THE FIELD REGISTRY — one line per CMS field
  includes/settings.php                      the SNC Settings schema
  includes/rest/                             the snc/v1 API
  includes/revalidate.php                    tells the website when content changes
  seed/                                      seeding and sample removal
docs/                                        design system, plan, progress log, these guides
BLOCKERS.md                                  what is still waiting on the college or owner
```

### Adding a CMS field

Add one line to `includes/meta.php`. That single entry registers the field, draws the input
in wp-admin and sanitises the value. Then expose it in `includes/rest/serializers.php` and
mirror the shape in `frontend/lib/wp/types.ts` — the API response is a contract between
those two files and they change together. Never hand-roll a meta box.

---

## 2. Configuration

Five settings, in two places. The two secrets **must match each other**.

On the Next.js host:

| Name | What it is |
|---|---|
| `WORDPRESS_URL` | the CMS origin, e.g. `https://cms.snccollegedpr.in` |
| `NEXT_PUBLIC_SITE_URL` | the public site origin, e.g. `https://snccollegedpr.in` |
| `REVALIDATE_SECRET` | shared secret; must equal `SNC_REVALIDATE_SECRET` |

In the CMS's `wp-config.php`:

| Name | What it is |
|---|---|
| `SNC_FRONTEND_URL` | the public site origin |
| `SNC_REVALIDATE_SECRET` | shared secret; must equal `REVALIDATE_SECRET` |

Also in production `wp-config.php`: `WP_DEBUG` and `WP_DEBUG_DISPLAY` both **false**.
`WP_DEBUG_DISPLAY` matters more than it looks — a PHP notice printed into a response corrupts
the JSON and produces confusing, hard-to-trace errors on the website.

Secrets are never committed. They are not in this document, and they must never be given a
`NEXT_PUBLIC_` name, which would publish them to every visitor's browser.

---

## 3. How content reaches the website

The site caches aggressively, so edits are pushed rather than polled:

1. An editor clicks Publish or Update in wp-admin.
2. `includes/revalidate.php` works out which cache tags that content affects.
3. At the end of the request it POSTs them to `{SNC_FRONTEND_URL}/api/revalidate` with the
   header `x-snc-secret`.
4. The website clears those tags. The change is live within seconds.

**If edits stop appearing on the website, this is almost always the thing that has broken.**
Check, in order:

- Do `REVALIDATE_SECRET` and `SNC_REVALIDATE_SECRET` still match?
- Is `SNC_FRONTEND_URL` right, and can the CMS server reach it over the network?
- Turn on `WP_DEBUG` temporarily: every attempt is then logged to `wp-content/debug.log` as
  `[snc] revalidate <tags> → <status>`. A `200` means the website accepted it.

One known limit: a **permanent** delete straight from the database revalidates nothing,
because WordPress's `deleted_post` hook fires after the row is gone and the post type can no
longer be resolved. Deleting through wp-admin is fine — it goes to Trash first, which does
revalidate. The sample purge (§6) queues its tags itself for the same reason.

---

## 4. Backups

**Back up before any upgrade, any plugin change and anything destructive. Write the file
outside the website directory.**

Database:

```bash
mysqldump -h 127.0.0.1 -u <user> -p snc_db > snc_db_YYYY-MM-DD.sql
```

Uploads (all the PDFs and photographs — these cannot be regenerated):

```bash
tar -czf snc_uploads_YYYY-MM-DD.tar.gz wp-content/uploads
```

Scheduled backups of both: **[TO BE FILLED]** — not yet configured.

### Restoring

```bash
mysql -h 127.0.0.1 -u <user> -p snc_db < snc_db_YYYY-MM-DD.sql
tar -xzf snc_uploads_YYYY-MM-DD.tar.gz
```

Then open wp-admin and check that one notice, one merit list and one photo album all load,
and that a PDF downloads. Restoring the database without the matching uploads leaves every
file link broken, so always restore the pair from the same date.

**A backup you have never restored is not a backup.** Test a restore into a scratch database
before relying on it.

---

## 5. Accounts

| Role | Can do |
|---|---|
| **Administrator** | everything, including **SNC Settings** and user management |
| **Editor** | all content — notices, merit lists, documents, news, albums, faculty, committees, testimonials — but **not** SNC Settings |

SNC Settings requires the `manage_options` capability, which only Administrators have. Office
staff who need to change phone numbers or the admission status therefore need an
Administrator account; staff who only publish content should be Editors.

To add someone: **Users → Add New**, fill in username and email, choose the role, and let
WordPress email them to set their own password. Give out Administrator sparingly.

When someone leaves, **delete or demote the account the same day** and reassign their content
to another user when WordPress offers.

---

## 6. Seeding and sample data

The seeder fills a fresh database with the real, verified content (programmes, leadership
messages, committees, the 33 pages and site settings):

```bash
php wp-content/plugins/snc-core-headless/seed/run.php
```

It never overwrites a page an editor has already changed.

`--samples` additionally creates test records whose titles all begin with `[SAMPLE]`.
**Production is seeded without `--samples`.**

To remove them again once real content has arrived:

```bash
php wp-content/plugins/snc-core-headless/seed/run.php --purge-samples --dry-run   # list first
php wp-content/plugins/snc-core-headless/seed/run.php --purge-samples
```

This deletes only `[SAMPLE]` records and the files generated for them; anything typed into
wp-admin survives. Do **not** use `--reset` for this — it empties the content types
completely and will destroy the college's own content.

---

## 7. Old links from the previous website

`frontend/next.config.ts` redirects all 34 old URLs listed in design system §7.3 to their new
routes, permanently. Verified locally on 2026-10-12: every one redirects, with and without a
trailing slash, and every destination returns 200. `/about/` and `/iqac/` are handled by
Next's trailing-slash normalisation rather than an explicit entry, which is why the table
lists 34 sources and the file lists 31.

Note that Next emits **308**, not 301. Both are permanent and search engines treat them the
same; 308 additionally preserves the request method. Do not "fix" this.

Old PDF and image links — `/wp-content/uploads/...` — are redirected to the CMS media host so
that links printed on paper or shared on WhatsApp keep working. **This must keep working
after any hosting change**, or every old document link the college has given out breaks.

---

## 8. Security checklist

- These files must **not** exist on the server: `autologin.php`, `auto-login-link.txt`,
  `setup_wp.php`. (Absent from the repository as of 2026-10-12.)
- `WP_DEBUG` and `WP_DEBUG_DISPLAY` false in production.
- The CMS serves `X-Robots-Tag: noindex`.
- WordPress core, the plugin and PHP kept patched. Back up first, every time.
- Secrets only in environment configuration, never in the repository, never `NEXT_PUBLIC_*`.
- Student enquiries are personal data. They are visible to anyone who can log in to the CMS,
  which is another reason to keep the account list short.

---

## 9. Routine jobs

| When | What |
|---|---|
| Admissions open | SNC Settings → Admissions: tick **Admissions are open**, set the session and the Apply Now link |
| Admissions close | untick **Admissions are open** |
| Each new session | add the session to **Sessions** and start tagging new lists and documents with it |
| Monthly | check the backups actually ran, and that a restore still works |
| Monthly | review the user list and remove anyone who has left |

---

## 10. When something is wrong

| Symptom | Look at |
|---|---|
| Edits do not appear on the website | §3 — revalidation, the two secrets, `debug.log` |
| A page shows "no items yet" that should have items | is the item **published** and tagged? Merit lists need all four tags |
| An old link 404s | §7 — the redirect table in `next.config.ts` |
| PDFs 404 | the `/wp-content/uploads/` redirect, and whether the uploads folder was restored |
| JSON errors / blank sections | `WP_DEBUG_DISPLAY` is probably on; turn it off |
| The CMS appears in Google | the `noindex` header has been lost |

---

## 11. Who to call

| Role | Name | Contact |
|---|---|---|
| Website development team | **[TO BE FILLED]** | **[TO BE FILLED]** |
| Hosting provider (website) | **[TO BE FILLED]** | **[TO BE FILLED]** |
| Hosting provider (CMS) | **[TO BE FILLED]** | **[TO BE FILLED]** |
| Domain registrar for `snccollegedpr.in` | **[TO BE FILLED]** | **[TO BE FILLED]** |
| College staff member responsible for the website | **[TO BE FILLED]** | **[TO BE FILLED]** |

These are deliberately blank. Filling them in with a guess would send someone to the wrong
number during an outage. See `BLOCKERS.md`.

---

## 12. Reference documents

| Document | What it is for |
|---|---|
| `docs/CMS-HANDOVER-GUIDE.md` | the day-to-day publishing guide for office staff |
| `docs/01-DESIGN-SYSTEM.md` | how the site must look and behave; §7.3 is the redirect table, §8.3 the verified-facts table |
| `docs/02-IMPLEMENTATION-PLAN.md` | how the site was built, and the rules any agent working on it must follow |
| `docs/PROGRESS.md` | what was done in each phase, the deviations and why |
| `docs/03-CONTENT-REQUIREMENTS.md` | what content the college still owes |
| `docs/COLLEGE-CONTENT-REQUEST.md` | the same list written for the college office |
| `antigravity.md` | the remaining phase plan, A–I |
| `BLOCKERS.md` | everything currently waiting on someone else |
