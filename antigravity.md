# SNC College website — phase plan for Antigravity

**Read this file before starting any phase, and read only the phase you were asked for.**

This project was built through Phase 10 by a previous agent. The engineering is complete and
the site builds, passes Lighthouse and has no fabricated content. What remains is the work
that needs decisions, real college content, a production environment and device testing.

The phases below are **A to I** so they never collide with Phases 0–10 in
`docs/02-IMPLEMENTATION-PLAN.md`, which are finished.

---

## Before your first phase

Read these in full, in this order. They are binding and they win over your own preferences:

1. `docs/01-DESIGN-SYSTEM.md` — how the site must look and behave.
2. `docs/02-IMPLEMENTATION-PLAN.md` — Part A (rules for the implementing agent) especially.
3. `docs/PROGRESS.md` — what has been done, the deviations, and the open questions.
4. `docs/03-CONTENT-REQUIREMENTS.md` — what the college still owes.

Rules and skills are already installed for you:

| Where | What |
|---|---|
| `AGENTS.md` | always active |
| `.agents/rules/10-never-invent-content.md` | always active — the one rule that must never bend |
| `.agents/rules/20-design-tokens.md` | loads when you touch `frontend/` |
| `.agents/rules/30-nextjs-16.md` | loads when you touch `frontend/app` or `lib/wp` |
| `.agents/rules/40-wordpress-plugin.md` | loads when you touch the plugin |
| `.agents/skills/design-review` | run at the end of every UI task |
| `.agents/skills/visual-verification` | screenshot and measure pages in a real browser |
| `.agents/skills/cms-field` | make a piece of content editable from wp-admin |

### How to work (from plan Part A)

- **One phase at a time.** Do not start the next phase until every acceptance box of the
  current one is ticked and recorded in `docs/PROGRESS.md`.
- At the end of a phase, append an entry to `docs/PROGRESS.md` using the Part D template:
  what was done, files changed, deviations **with reasons**, screenshots, open questions.
- If something is ambiguous or looks wrong, **write the question in `docs/PROGRESS.md` under
  "Open questions"** and build the unambiguous parts. Do not invent a new direction.
- Do not refactor or rename outside the current phase's scope.
- Do not rewrite `docs/01-DESIGN-SYSTEM.md` or `docs/02-IMPLEMENTATION-PLAN.md`. Record
  corrections in `docs/PROGRESS.md` instead, and change the design system only for a plain
  factual error, saying so in your entry.
- Never commit unless the owner asks.

### Definition of done, every phase

```bash
cd frontend
npm run lint          # zero new warnings
npx tsc --noEmit      # zero errors
npm run build         # succeeds
```

Plus the eight banned-pattern greps in plan Part C (all empty except the two documented
exceptions), plus the `design-review` skill for anything visual, plus a `docs/PROGRESS.md`
entry. **A phase with no PROGRESS.md entry is not done.**

### The environment

- Frontend: `cd frontend && npm run dev` → `http://localhost:3000`. Check whether a dev
  server is already running before starting another; a second one refuses to start.
- WordPress: Laragon PHP built-in server on `http://localhost:8881`, plain permalinks,
  database `snc_db`. PHP binary
  `C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe`.
- API shape check: `curl -s "http://localhost:8881/?rest_route=/snc/v1/settings"`.
- Reseed: `php wp-content/plugins/snc-core-headless/seed/run.php [--reset] [--samples]`.
- The WordPress server is single-threaded. If `npm run build` stalls on prerendering, stop
  the dev server first.
- Back the database up before anything destructive, to a file **outside** the repository.

---

## Phase A — Orientation and baseline

**Goal:** prove the stack runs and you can see what you are changing. No feature work.

1. Start WordPress and the frontend; confirm `/` , `/about`, `/admissions/merit-lists` and
   `/contact` return 200.
2. Set up the `visual-verification` skill and capture the homepage at 360, 768, 1280 and
   1440 px. Confirm no horizontal overflow at any width.
3. Run the three quality gates and the eight Part C greps; confirm they are clean **before**
   you change anything, so you know what you inherited.
4. Read the two "Phase 10 follow-up" entries in `docs/PROGRESS.md`. They explain why the
   navigation deliberately disagrees with design system §7.2 and why the mobile drawer is
   portalled. **Do not "fix" either.**

**Done when:** a PROGRESS.md entry records the baseline output and the four screenshots
exist under `docs/screenshots/phase-A/`.

---

## Phase B — Close the open decisions

**Goal:** clear the owner questions blocking tidy-up. **Ask the owner first** — these are
decisions, not judgement calls. Do not guess. If an answer does not come, leave the item and
say so.

Open questions 2, 3, 4 in `docs/PROGRESS.md`:

1. **Header button.** Today it is a gold "Apply Now" with "Contact Us" as the eighth nav
   item. The college's own menu has "Contact Us" as the button instead. If the owner wants
   that, change the `<Button>` in `components/layout/SiteHeader.tsx` and drop the Contact Us
   item from `config/navigation.ts` — and re-check the header at 1280 px, which is tight.
2. **`/academics`.** The page exists in WordPress but nothing links to it, because the
   college's menu has no "Academics" item and "Courses" points at `/academics/programmes`.
   Leave it unlinked, delete it, or repoint Courses — owner's call.
3. **`/news` breadcrumbs** read "Home › Gallery › News & Events", because News sits in the
   Gallery menu. Accept or move it.

**Done when:** each question is answered and either implemented or recorded as declined, and
the answers are written into the "Decisions" section of `docs/PROGRESS.md`.

---

## Phase C — Content intake from the college

**Goal:** get the real content into WordPress and remove every `[SAMPLE]` record. This is
the largest remaining blocker and most of it is not code.

The authoritative list is `docs/03-CONTENT-REQUIREMENTS.md`. Currently seeded as samples:
26 notices, 60 merit lists, 16 documents, 10 faculty, 4 committees, 15 news items, 4 photo
albums. Programmes, leadership messages and settings are already real.

1. Produce a single short request document for the college from
   `docs/03-CONTENT-REQUIREMENTS.md`, grouped by who has to supply it and ordered by what
   blocks launch. Plain language, no jargon — an office clerk has to act on it.
2. As content arrives, enter it in wp-admin (or extend the seed for anything structural).
   Any field the college needs that does not exist yet → use the `cms-field` skill.
3. Resolve the facts still marked "confirm" in design system §8.3: the founder's name
   spelling ("Prashant" vs "Prasshant"), NAAC status, the AISHE code, the Instagram and
   YouTube handles, and the programme list beyond B.A. and B.Sc.
4. Delete sample records as real ones replace them. Production is seeded **without**
   `--samples`.

**Never invent a replacement for missing content.** An empty state is correct; a plausible
placeholder is a defect.

**Done when:** `curl` across the `snc/v1` endpoints returns zero occurrences of `[SAMPLE]`,
and every §8.3 "confirm" row is either verified or still visibly absent from the site.

---

## Phase D — Real photography and the visual layer

**Goal:** replace every `ImagePlaceholder` with the college's own photographs. Do this
**after** Phase C delivers the images; it cannot start without them.

1. Hero slides (`hero_slide`): desktop 1920×720 and mobile 1080×1350 per slide. With no
   slides the site shows `StaticHero`, which is correct and must keep working.
2. Homepage: the About photo, the CTA band background, and exactly five gallery photos for
   the "Life @ SNC" bento (the section hides below five).
3. Mega-menu image panels, page hero backgrounds, programme card images, faculty portraits.
4. The default Open Graph share image (SNC Settings → Search & sharing). Until it is set,
   no page carries a share image.
5. A transparent **SVG** of the emblem if the college has one — the bundled 638 px PNG is
   slightly soft at the 288 px hero size.

Every image through `next/image` with explicit `sizes` and meaningful `alt`. Hero image
≤ 250 KB. Stock photography is banned outright. Re-run Lighthouse after this phase — images
are the most likely regression.

**Done when:** no `ImagePlaceholder` remains in a production page, and the performance budget
in §10 still holds.

---

## Phase E — Google reviews go live

**Goal:** publish the real reviews behind "What People Say About Us" on the homepage.

The section, the admin fields and the rating panel are built and working. It is empty by
design and the homepage omits it until there is a score or a review. Nothing here requires
new UI unless the owner changes the approach.

1. Enter from the college's Google Business listing: SNC Settings → Reviews → the score, the
   review count and the listing link; then one "Review" post per featured review with the
   reviewer's name exactly as Google shows it, the text, the stars, the date and the
   permalink, and "Cleared to publish" ticked.
2. Delete the four `[SAMPLE]` reviews.
3. **Only if the owner asks**, replace manual entry with the Google Places API. It needs a
   billed Google Cloud key (server-side only, never `NEXT_PUBLIC_*`), returns at most five
   reviews, and requires Google attribution plus a link to the original. Adding the
   dependency needs the owner's approval under plan rule A2.7.

**Never write a review, a score or a review count into code, the seed, or settings.** A
value was set temporarily once to photograph the layout and then cleared; do the same if you
need a screenshot.

**Done when:** real reviews render, or the section is correctly absent because the college
has not supplied them.

---

## Phase F — Accessibility and performance re-pass

**Goal:** re-verify §10 with real content in place. The Phase 10 numbers were measured with
sample data on a laptop and will have moved.

1. Lighthouse mobile, production build, on the eight audited pages: home, a section page,
   merit lists, notices, a programme detail, faculty, a gallery album, contact. Targets:
   Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Paste the table into
   `docs/PROGRESS.md`.
2. **The known miss: LCP is 2.9–3.1 s against a < 2.5 s budget.** First paint is fast
   (FCP 0.9 s); the LCP element is text that repaints when Merriweather loads. Measure on
   production hosting first — the earlier figure had no CDN and no edge compression. If it
   persists, the lever is the serif: self-host a subset, or use the sans for hero text.
3. Full axe DevTools pass. Fix every serious and critical issue.
4. Keyboard pass on every interactive component: mega menus, mobile drawer, tabs, document
   filters, the slider, the lightbox and the enquiry form.
5. Confirm zero console errors on every audited page at 360 and 1280 px.

**Done when:** the score table is in `docs/PROGRESS.md` and every target is met or the miss
is explained with the measurement that supports it.

---

## Phase G — Cross-browser and device testing

**Goal:** the one piece of QA that genuinely cannot be done headlessly.

1. Chrome, Firefox, Safari on iOS, Samsung Internet on Android.
2. On a real iPhone: the mobile action bar and `env(safe-area-inset-bottom)`, and that the
   footer is not hidden behind it.
3. The mobile drawer on a real device — focus trap, scroll lock, and that it is not clipped
   (it is portalled to `<body>` on purpose; see the Phase 10 follow-up entry).
4. Devanagari rendering on Windows, Android and iOS — it uses system font fallbacks, so it
   looks different on each.
5. Forms on mobile keyboards; `tel:` and WhatsApp links on a real phone.

**Done when:** a results table per browser is in `docs/PROGRESS.md` with any defect either
fixed or logged.

---

## Phase H — Production deployment

**Goal:** the site live on `snccollegedpr.in`. Needs owner decisions on hosting and DNS, so
confirm those before starting.

1. **Environment.** `WORDPRESS_URL`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET` on the
   Next.js host; `SNC_FRONTEND_URL` and `SNC_REVALIDATE_SECRET` in production
   `wp-config.php`, matching. `WP_DEBUG` and `WP_DEBUG_DISPLAY` false.
2. **Hosting.** Next.js on the main domain, WordPress on `cms.snccollegedpr.in` unless the
   owner says otherwise. Confirm the CMS serves `X-Robots-Tag: noindex`.
3. **Verify in production:** all 34 legacy redirects from design system §7.3 return 301 to
   the right page; `/wp-content/uploads/:path*` still resolves so old PDF links survive;
   end-to-end revalidation (edit in wp-admin → change appears on the site).
4. **Security:** `autologin.php`, `auto-login-link.txt` and `setup_wp.php` absent from the
   server. Database and uploads backups configured and a restore tested.
5. Submit the sitemap to Search Console.

**Done when:** every item is verified **on production**, not locally, and recorded.

---

## Phase I — Handover

**Goal:** the college can run the site without an agency.

1. A short guide for office staff, with screenshots, covering the jobs they actually do:
   publish a notice, upload a merit list, add a document, add a news item, create a photo
   album, update contact details, add a Google review.
2. Written down: where things live, who to call, how to restore a backup, how to add a user.
3. Train the named person from `docs/03-CONTENT-REQUIREMENTS.md` §8.5.
4. Record the owner's sign-off in `docs/PROGRESS.md` — the last unticked box of Phase 10.

**Done when:** the guide exists, the training has happened, and sign-off is recorded.

---

## The five things that cause the most damage here

1. **Inventing a fact** — a fee, a grade, a phone number, a review. This is the one
   unforgivable error on this project. Read `.agents/rules/10-never-invent-content.md`.
2. **A section with its own container or padding.** It breaks the alignment that holds the
   whole design together. Always `<Section>` + `<Container>`.
3. **Using Tailwind's default palette.** It is deleted; `bg-gray-100` renders nothing at all,
   and the bug is invisible until you look at the page.
4. **Not looking at the page.** Every serious layout bug found in this project was invisible
   in the code. Use the `visual-verification` skill.
5. **Finishing without a `docs/PROGRESS.md` entry.** The next agent — or the next you — has
   no other record of what happened or why.
