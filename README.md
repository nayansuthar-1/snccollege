# SNC College website

Website for **Shiv Narayan Choubisa College, Simalwara, Dungarpur** — a headless build: a
Next.js site that reads its content from WordPress over a custom REST API.

| Part | Stack |
|---|---|
| Website | Next.js 16.4 / React 19.3, TypeScript, Tailwind v4 |
| CMS | WordPress 7.1.3 on PHP 8.3, MySQL |

Visitors only ever see the Next.js site. WordPress is an editing screen and a JSON API; its
public theme is switched off and every non-admin, non-API request to it redirects to the site.

---

## What is in this repository

This repository holds **the project's own source**, not a full WordPress install.

```
frontend/                                  the Next.js website
wp-content/plugins/snc-core-headless/      the custom WordPress plugin (content model + API)
docs/                                      design system, implementation plan, progress log, guides
.agents/                                   rules and skills for AI agents working on this repo
AGENTS.md                                  instructions every agent must read first
antigravity.md                             the remaining phase plan (A–I)
BLOCKERS.md                                what is waiting on the college or the owner
```

**Deliberately not committed**, and why:

| Not here | Why |
|---|---|
| `wp-config.php` | holds the database password and `SNC_REVALIDATE_SECRET` |
| `frontend/.env.local` | holds the matching `REVALIDATE_SECRET` |
| WordPress core (`wp-admin/`, `wp-includes/`, root `wp-*.php`) | vendor code, never modified here — reinstall WordPress 7.1.3 from wordpress.org |
| `wp-content/uploads/` | the college's PDFs and photographs; back these up separately, they cannot be regenerated |
| `wp-content/themes/`, other plugins | unused or third-party |
| `node_modules/`, `.next/` | build output |

**This repository is not a backup.** A working site needs this code *plus* a database dump
*plus* the uploads folder. See `docs/OPERATIONS-RUNBOOK.md` §4.

---

## Setting up locally

**1. WordPress.** Install WordPress 7.1.3 and a MySQL database, drop
`wp-content/plugins/snc-core-headless/` into place and activate it. Add to `wp-config.php`:

```php
define('SNC_FRONTEND_URL', 'http://localhost:3000');
define('SNC_REVALIDATE_SECRET', '<a long random string>');
```

Restore a database dump, or seed a fresh one:

```bash
php wp-content/plugins/snc-core-headless/seed/run.php --samples
```

`--samples` adds test records whose titles all start with `[SAMPLE]`. Production is seeded
**without** it. To remove them later without touching real content:

```bash
php wp-content/plugins/snc-core-headless/seed/run.php --purge-samples --dry-run
php wp-content/plugins/snc-core-headless/seed/run.php --purge-samples
```

**2. Frontend.**

```bash
cd frontend
cp .env.example .env.local     # then fill it in
npm install
npm run dev                    # http://localhost:3000
```

`REVALIDATE_SECRET` in `.env.local` **must match** `SNC_REVALIDATE_SECRET` in `wp-config.php`,
or edits in wp-admin will never appear on the site.

---

## Before you change anything

Read `AGENTS.md`. The binding documents are `docs/01-DESIGN-SYSTEM.md` and
`docs/02-IMPLEMENTATION-PLAN.md`, and `docs/PROGRESS.md` records what has been done and why.

The hard rule, above all others: **never invent a fact about the college.** Fees, grades,
accreditation, phone numbers, staff names, reviews and statistics come from WordPress or they
do not appear on the site. An empty state is correct; a plausible placeholder is a defect.
See `.agents/rules/10-never-invent-content.md`.

Checks that must pass before any change is considered done:

```bash
cd frontend
npm run lint          # zero new warnings
npx tsc --noEmit      # zero errors
npm run build         # succeeds
```

plus the eight banned-pattern greps in `docs/02-IMPLEMENTATION-PLAN.md` Part C.

---

## Documentation

| Document | For |
|---|---|
| `docs/CMS-HANDOVER-GUIDE.md` | college office staff — how to publish a notice, a merit list, a photo album |
| `docs/OPERATIONS-RUNBOOK.md` | whoever maintains the site — backups, restores, users, troubleshooting |
| `docs/01-DESIGN-SYSTEM.md` | how the site must look and behave |
| `docs/02-IMPLEMENTATION-PLAN.md` | how it was built and the rules for changing it |
| `docs/PROGRESS.md` | the phase-by-phase log, deviations and open questions |
| `BLOCKERS.md` | everything currently waiting on someone else |
