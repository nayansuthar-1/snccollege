# SNC Website: Progress Log

Current phase: **all work that does not need the college, the owner or a real device is complete.** Phases A, B, F and I (parts 1–2) are done; Phase C's intake document and sample-removal tooling are done; Phase H's locally-verifiable items all pass. Phases C, D, E and G, and the production half of H, are blocked — see `BLOCKERS.md` at the repository root.

Backup of the old build: `d:\singularitylabs\SNC_backup_before_rebuild_2026-10-09.tar.gz` (old frontend source, plugin, root scripts).

---

## Phase 0: Clean slate & foundation (2026-10-09, Claude)
**Status:** done
**Summary:** Fixed the root cause of the cramped layout: the unlayered `* {margin:0;padding:0}` reset that overrode every Tailwind spacing class. Rewrote `globals.css` with design tokens only, and removed Tailwind's default palette (`--color-*: initial`). Fonts now load through `next/font` (Merriweather and Plus Jakarta Sans). Image hosts are restricted to the WordPress uploads path.
**Files changed:** `app/globals.css`, `app/layout.tsx`, `next.config.ts`, `.gitignore`, `.env.example`, `.env.local`, `lib/cn.ts`, `lib/format.ts`, `lib/contact.ts`, `config/site.ts`, `public/images/emblem.jpg` (copy of logo.jpg)
**Acceptance checklist:**
- [x] Insecure/stray files deleted (run by the owner on 2026-10-09 after the agent was blocked; verified)
- [ ] Git initialised with snapshot commit. **Not done.** The agent may only commit when the owner asks. The tar.gz backup above was made instead.
- [x] Old `components/`, `context/`, old routes and `lib/wp.ts` removed (owner, verified: build lists only new routes)
- [x] `globals.css` contains only `@import`, `@theme`, `@layer`; check 8 is empty
- [x] Padding/margin utilities work (verified in screenshots)
- [x] Default palette removed (`bg-blue-500` produces nothing)
- [x] No fonts.googleapis `<link>` in rendered HTML
- [x] tsc, lint (new code) and build pass

Cleanup commands were run by the owner (2026-10-09).

**Deviations from plan:**
- **Noto Sans Devanagari web font dropped.** `next/font/google` fails on it under Turbopack (Next 16.4: "next/font/google queries have exactly one entry"). Hindi text now falls back to system fonts (Nirmala UI / Noto / Kohinoor). Design system §3.2 has been updated.
- Added a `whatsapp` colour token (`#25D366`) so no hex value appears in components. Design system §3.1/§5.22 and Plan check 2 have been updated.

---

## Phase 1: Design primitives & styleguide (2026-10-09, Claude)
**Status:** done
**Summary:** Built every component from design system §5 that does not need data: UI primitives, cards, page templates, document list and social icons. `/styleguide` renders all of them with labelled sample props and returns 404 in production.
**Files added:**
- `components/ui/`: Container, Section, SectionHeader, Button, Badge, IconTile, Tabs (client), TabLinks (URL-driven tabs), Accordion, EmptyState, ImagePlaceholder, Pagination, Breadcrumbs (+ JSON-LD)
- `components/cards/`: FeatureCard, ProgrammeCard, NewsCard, PersonCard, MessageCard, TestimonialCard, InfoCard
- `components/page/`: PageHero, SectionNav, SectionPageLayout, LandingPageLayout, Prose
- `components/documents/`: DocumentList, DocumentRow
- `components/icons/social.tsx`
- `lib/wp/types.ts` (full API contract from Plan B5, plus `emptySettings`)
- `app/styleguide/page.tsx`, `app/not-found.tsx`
**Acceptance checklist:**
- [x] Class strings match design system §3–§5
- [x] `/styleguide` renders with no overflow (1280 and 360 checked)
- [x] Tabs: arrow keys, Home/End, `aria-selected`. Accordion works without JS (`<details>`)
- [x] Buttons render `<a>`/`next/link` for links (external links get rel and sr-only text) and `<button>` otherwise
- [x] DocumentList with 0 items shows EmptyState
- [x] Part C checks are empty for all new files
**Notes for later phases:**
- `Pagination` takes `baseHref` (string) instead of a function, so it works from Server Components.
- `TabLinks` is the URL-driven tab bar to use for notices/news filters. `Tabs` is for in-page panels only.
- `DocumentList` takes `metaColumns` + `item.meta[]`, which lets merit lists, notices and reports share one component.

---

## Phase 2: Global chrome (2026-10-09, Claude)
**Status:** done (contact details are blank until Phase 4 connects WordPress settings)
**Summary:** Built the utility bar, sticky header with mega menus, mobile drawer, footer, mobile bottom action bar, desktop WhatsApp button and skip link. All navigation lives in `config/navigation.ts`.
**Files added:** `config/navigation.ts`, `components/layout/` (SkipLink, TopBar, SocialLinks, BrandMark, SiteHeader, DesktopNav, MegaMenu, MobileNav, SiteFooter, MobileActionBar, WhatsAppButton), `lib/contact.ts`
**Acceptance checklist:**
- [x] 1280 px: 40 px utility bar, 80 px header, 7 items + Apply Now on one line (the affiliation line of the brand subtitle is hidden at xl and shown again at 2xl so everything fits)
- [x] 1024–1279 px: hamburger, no desktop nav, no overflow
- [x] 360 px: 64 px header, emblem + name, hamburger, no horizontal scroll
- [x] Mega menus: hover (120 ms open / 200 ms close), click, ArrowDown focuses the first link, Escape returns focus, outside click closes, closes on navigation
- [x] Mobile drawer: focus trap, Escape, scroll lock, focus returns to the trigger, accordion groups
- [x] Footer: 4 columns at lg, 2 at md, 1 on mobile; gold top border; bottom bar
- [x] Only one floating element per breakpoint
- [ ] Lighthouse accessibility ≥ 95: **not run yet.** Run it in Phase 5 together with the homepage.
**Banned-pattern check output:** all 8 checks empty for the new code.
**Screenshots:** `docs/screenshots/phase-2/` (header-1280, header-1024, home-360, styleguide-1280, 404-1280)
**Known limitations:**
- Phone, email, socials, address and Hindi name are hidden because the layout uses `emptySettings` until Phase 4 (`getSettings()`). This is intentional: no hardcoded facts.
- Mega-menu image panels use the dark placeholder until real photos arrive (`docs/03-CONTENT-REQUIREMENTS.md` §3).

---

## Phase 3: WordPress backend (2026-10-09, Claude)
**Status:** done (owner review of admin screens pending)
**Summary:** Rewrote the `snc-core-headless` plugin (v2.0.0) to the content model in Plan B4 and the API contract in Plan B5. All Antigravity seed data (fake fees, B.Com/M.A. programmes, fake merit lists, notices and committees) was deleted. The database was re-seeded with verified content migrated from the old site, plus clearly labelled `[SAMPLE]` test records.
**Environment found:** WordPress 7.1.3 on Laragon PHP 8.3 built-in server (`php -S localhost:8881`), MySQL `snc_db`, **plain permalinks**, so the frontend calls `/?rest_route=/snc/v1/…` (Plan B5 updated).
**Backups:** DB dump before changes: `d:\singularitylabs\SNC_db_backup_before_phase3_2026-10-09.sql`. The old plugin files are in the tar.gz backup.
**Files (plugin):**
- `snc-core-headless.php`: bootstrap
- `includes/post-types.php`, `taxonomies.php` (default terms inserted on activation and on each version change)
- `includes/meta.php`: **field registry**. One array drives meta registration, meta boxes and sanitising. To add a field, add one line there.
- `includes/settings.php`: single option `snc_settings`
- `includes/headless.php`: redirect the WP front end, noindex, no xmlrpc/comments/emoji, hide `/wp/v2/users`
- `includes/revalidate.php`: tag map → POST to the frontend at shutdown
- `includes/rest/serializers.php`, `routes.php`, `enquiry.php`
- `includes/admin/fields.php`, `meta-boxes.php`, `settings-page.php` ("SNC Settings" menu), `admin-ux.php` (Posts renamed "News & Events", taxonomy filters, "File" column, enquiry viewer)
- `assets/admin.js`, `assets/admin.css`: media pickers, gallery picker, members repeater
- `seed/content.php` (verified content), `seed/seed.php`, `seed/run.php`
**wp-config.php:** added `SNC_FRONTEND_URL`, `SNC_REVALIDATE_SECRET` (same value as `frontend/.env.local`), and set `WP_DEBUG_DISPLAY` to false (PHP notices were going to corrupt the JSON).
**How to (re)seed:** `C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe wp-content/plugins/snc-core-headless/seed/run.php [--reset] [--samples]` (or `wp snc seed` where WP-CLI exists). The seed never overwrites a page an editor has changed.
**Seeded real content:** settings (verified contacts/socials/Hindi name, homepage about text, 6 "why choose" items, 4 facts); programmes B.A. and B.Sc. (subjects, duration, eligibility from the old Admission page); Chairman message (sentence listing unoffered programmes removed); Principal message (name unknown, so titled "The Principal"); 11 committees (names and purposes only, no members); **33 pages** for every route in design system §7.1, including privacy policy.
**Seeded samples (`[SAMPLE]`):** 7 notices, 24 merit lists (2 sessions × B.A./B.Sc. × merit/waiting × General/OBC/ST), 8 documents, 4 faculty, 3 news items. Each has a generated small PDF so file links and sizes can be tested.
**Acceptance checklist:**
- [x] Every endpoint returns the documented shape (checked with curl, all 20 routes; unknown page/programme returns 404)
- [x] `/page?path=about/vision-mission` works; unknown path returns 404 JSON
- [x] Merit lists filter by year/programme/list_type/category and return filter terms. Fixed a bug where hierarchical `hide_empty` produced a JSON object instead of an array.
- [x] File objects carry the real `size_bytes`
- [x] Saving triggers POST to the frontend with the right tags (log: `[snc] revalidate settings,home → 200`)
- [x] Enquiry: valid 201, honeypot 400, invalid 400 with field errors, 6th within 10 min 429. Test enquiries deleted afterwards.
- [x] WP root redirects to the frontend; wp-admin and the REST API still work; `X-Robots-Tag: noindex`
- [x] No fake data remains; everything unverified is titled `[SAMPLE]`
- [ ] Admin screens reviewed by the owner (rendered without PHP warnings in a CLI smoke test, but not yet reviewed by a person)
**Deviations from plan:**
- CPTs use the **classic edit screen** (title + fields + taxonomy checkboxes), which is faster for office staff. Pages and News use the block editor.
- CPTs and meta are not exposed in `/wp/v2` (`show_in_rest` false); the frontend uses `snc/v1` only.
- Responses added `selected_year` (merit lists, committees) and `/documents?type=` accepts comma-separated types. Plan B5 and `types.ts` updated.
- Extra document types: `anti-ragging`. Extra cache tag: `paths`. A bulk save sending more than 20 tags collapses `page:*` into `pages` (Plan B6 updated).
- The CORS file was removed (all calls are server-to-server).
**Content to confirm with the college (also in 03-CONTENT-REQUIREMENTS.md):** mandatory-disclosure page text was trimmed (the obsolete software list was removed). The Tribal Girls' Incentive amount (₹5,000 on the old site) was omitted until confirmed. The UGC national anti-ragging helpline 1800-180-5522 was added.

---

## Phase 4: Frontend data layer (2026-10-09, Claude)
**Status:** done
**Files added:** `lib/wp/client.ts` (`wpFetch`, `wpPost`, `WpError`; `server-only`), `lib/wp/api.ts` (one function per endpoint, plus `submitEnquiry` forwarding the visitor IP), `lib/wp/html.tsx` (`renderWpHtml`), `app/api/revalidate/route.ts`. `app/layout.tsx` now uses `getSettings()`.
**Caching:** previous model (no `cacheComponents`): `fetch(..., { next: { revalidate: 300, tags } })` + `revalidateTag(tag, 'max')`. Page fetches carry `pages` and `page:{path}`.
**Acceptance checklist:**
- [x] Header/footer show real phones, email, address, socials and Hindi name from WP settings
- [x] WordPress unreachable: build still succeeds and the frame renders with contact fields hidden, no fake data (tested with `WORDPRESS_URL=http://127.0.0.1:9 npm run build`)
- [x] Settings edits revalidate within seconds (end-to-end: WP update_option → `/api/revalidate` 200)
- [x] `renderWpHtml` strips script/style/iframe from non-allowed hosts, inline style, on* handlers and `javascript:` links; rewrites WP links to site paths; external links open in a new tab; bare tables get wrapped. A permanent regression block lives on `/styleguide` (§ "WordPress HTML sanitiser check").
- [x] Revalidate route: wrong secret 401, bad body 400, valid 200
- [x] Part C checks empty (check 2 now scans .ts/.tsx only, since tokens live in globals.css); lint, tsc and build pass

---

## Phase 5: Homepage (2026-10-09, Claude)
**Status:** done (Lighthouse run pending, see below)
**Files added:** `components/home/` (HeroSlider (client, Embla + Autoplay), StaticHero, QuickLinks, AboutIntro, NoticeBoard, ProgrammesSection, WhyChoose, CtaBand, LeadershipSection, NewsSection, LifeAtSnc, TestimonialsSection); `app/page.tsx` rewritten.
**How it works:**
- Order is fixed per design system §6.1. Sections without data are omitted: leaders and news need ≥1 item, Life @ SNC needs exactly 5 gallery photos, testimonials need ≥3 consented.
- Backgrounds alternate white/ink-50 **by position**. The dark CTA band resets the alternation, so two same-colour sections never touch. Don't hardcode tones.
- **No slides published → `StaticHero`** (navy, college name, short about, Apply + Explore programmes, emblem on lg). This is what shows today, because the college hasn't supplied banner photos.
- The Why-choose icons are a whitelist (`WhyIconKey`) that matches the dropdown in SNC Settings.
- `CollegeOrUniversity` JSON-LD is built from settings; metadata uses `short_about`.
**Acceptance checklist:**
- [x] Section order and backgrounds match §6.1; no adjacent same-colour sections
- [x] Every section uses `Section`/`Container` (py-16 md:py-24), and left edges align with the logo (screenshots)
- [x] No merit-list filter, ticker, popup, unverified stats or stock images
- [x] Slider: priority image, keyboard arrows/dots with labels, autoplay off for reduced motion, stops on hover/focus/interaction. **Not yet visually tested with real slides** (none exist); re-check when banners arrive.
- [x] With empty lists, sections are omitted cleanly (static hero, gallery, testimonials currently omitted)
- [ ] Lighthouse mobile ≥ 90 / 95 / 95: **not run** (Lighthouse is not installed in this environment). Run it in Chrome DevTools on a production build (`npm run build && npm start`) and paste the scores here.
- [x] Screenshots `docs/screenshots/phase-5/` (1440, 360)
- [x] Part C checks empty; lint, tsc and build pass
**Deferred:** `AffiliationStrip` is not built. It is only added when official GGTU/VMOU logo files are supplied (content requirement 2.3).
**Before launch:** the homepage notice board currently shows `[SAMPLE]` notices. On production, seed **without** `--samples` (Plan Phase 10).

---

## Phase 6: Inner page templates & WordPress pages (2026-10-09, Claude)
**Status:** done
**Summary:** One catch-all route now renders all 33 WordPress pages. Section roots (`/about`, `/academics`, …) use the landing template with child-page cards; every other page uses the section template with the sticky sidebar. Leadership messages have their own route driven by the `leader` CPT.
**Files added:** `app/[...path]/page.tsx`, `app/error.tsx`, `app/about/messages/page.tsx`. Changed: `config/navigation.ts` (added `description` per link + `getSectionRoot()`), `components/page/LandingPageLayout.tsx` (cards show descriptions), `app/globals.css` (prose measure, see below).
**Acceptance checklist:**
- [x] All "WP Page" routes in design system §7.1 resolve with breadcrumbs, H1, sidebar (desktop) / "In this section" dropdown (mobile), correct active item
- [x] Section roots show the landing layout with child cards (verified `/academics`: 8 cards, no sidebar)
- [x] Prose renders headings, lists, tables, bold and links per §5.17; long tables fit on mobile
- [x] **A new page created in WordPress is reachable without a rebuild** — proved against a production server (`next start`) built *before* the page existed: `/students/isr-test` returned 200 with its content, unknown paths still 404. Test page deleted afterwards.
- [x] Unknown path → styled 404 with full chrome
- [x] 33 pages prerendered at build; `dynamicParams = true`
- [x] Part C checks empty; lint, tsc and build pass
- [x] Screenshots `docs/screenshots/phase-6/` (1440 section, landing, messages, prose measure; 360 section)

**Design fix made during this phase — prose line length.** Running text was ~95 characters per line, breaking design system §9 item 15 (max ~80). `.prose-snc` no longer constrains the whole block; instead its direct `p / ul / ol / h2–h6 / blockquote` children are capped at `65ch` (~75 characters) while **tables, figures and galleries keep the full column width**. Design system §3.2 and §5.17 updated to match. Do not reintroduce `max-w-3xl` on running text.

**Next.js 16 note for the implementing agent:** `error.tsx` receives **`retry`**, not `reset` (`reset` still exists but `retry` is the documented choice since 16.3). `params` is a Promise — `const { path } = await params`.

**Expected 404s until later phases.** 7 of the 41 navigation links do not resolve yet, because their routes belong to later phases. This is expected, not a bug:
| Link | Phase that builds it |
|------|----------------------|
| `/academics/programmes`, `/academics/programmes/ba`, `/academics/programmes/bsc`, `/academics/faculty` | Phase 8 |
| `/contact` | Phase 9 |
| `/campus-life/gallery` | Phase 9 |
| `/news` | Phase 9 |

**Note on new WordPress pages:** a page added in WordPress renders immediately, but it only appears in the menus and the section sidebar after it is added to `config/navigation.ts`. Tell the college this when handing over the CMS.

---

## Phase 7: Admissions, notices & document libraries (2026-10-09, Claude)
**Status:** done
**Summary:** The document-driven pages are built. Merit lists have a four-way filter bar plus search; notices have type tabs and pagination; nine other pages show their WordPress prose followed by a document list, grouped into one accordion per session. All filter state lives in the URL, so links are shareable and the back button works.
**Files added:** `config/documents.ts` (path → document-type map), `components/documents/DocumentFilters.tsx` (client), `components/documents/DocumentLibrary.tsx` (server), `lib/search-params.ts`, `app/admissions/merit-lists/page.tsx`, `app/students/notices/page.tsx`. Changed: `app/[...path]/page.tsx` (document sections + Apply button on the Admissions hero), `components/documents/DocumentList.tsx` (no-wrap meta columns), `lib/wp/api.ts` + `types.ts` (`NoticesResponse`), `app/globals.css` (`.snc-steps`), plugin `rest/routes.php` + `seed/`.

**Pages driven by `config/documents.ts`** (prose + document list, no route file needed): `/students/syllabus`, `/students/question-papers`, `/students/downloads`, `/iqac/reports`, `/academics/academic-calendar`, `/about/mandatory-disclosures`, `/iqac/naac`, `/iqac/ugc-compliance`, `/students/anti-ragging`, `/admissions/fee-structure`. **To add another: create the WordPress page, then add one entry to that file.**

**Acceptance checklist:**
- [x] Merit lists filter by session / programme / list type / category; URL is shareable; back button restores filters (state is URL-only)
- [x] **60 sample merit lists across 3 sessions, 2 programmes, 2 list types and 5 categories.** Latest session shows 20; filtering to `programme=bsc&category=ews&year=2024-25` returns 2; `q=waiting` returns 10; an unused category shows the "No lists match these filters" empty state with a Clear filters link
- [x] Mobile shows stacked rows with a download button, not a squeezed table (screenshot `merit-lists-360.png`)
- [x] Every file link shows type + real size and opens in a new tab, labelled e.g. *"Download [SAMPLE] B.A. Part I Merit List 1 (EWS) 2026-27 (PDF, 1 KB), opens in new tab"*
- [x] Notices: 26 samples over 6 types, 20 per page, 2 pages, type tabs, Important badges
- [x] Notices older than 7 days carry no "New" badge (2 of 26 qualify; badge count 4 = 2 notices × desktop + mobile renderings)
- [x] Document libraries group by session (syllabus, question papers, reports, calendar show one accordion per session, newest open); a single session renders as a plain list
- [x] Part C checks empty; lint, tsc and build pass
- [x] Screenshots `docs/screenshots/phase-7/`

**Deviations from the plan (both deliberate):**
1. **`documentTypeForPath` lives in `config/documents.ts`, not `config/navigation.ts`.** Document types are not navigation; mixing them would make the navigation file do two jobs.
2. **Admission steps are numbered cards, driven by content rather than code.** The plan asked for "numbered 1–4 cards". Hardcoding them would have put facts in the component, which §8.2 forbids. Instead, an ordered list in WordPress with the Additional CSS class **`snc-steps`** renders as numbered cards (styled in `globals.css`). Editors can apply it from Block settings → Advanced. Used on Admissions, How to Apply and Scholarships.

**Next.js 16 note:** `searchParams` is a Promise — `const sp = await searchParams`. Helpers are in `lib/search-params.ts`.
**React note:** the React compiler lint rejects `setState` inside `useEffect`. To sync a control with a changed prop, set state **during render** behind a previous-value guard (see `DocumentFilters.tsx`), as the React docs recommend.

**Seeding note:** when sample titles change, run the cleanup first — renamed samples get new slugs and the old rows stay behind. Safest is `run.php --reset --samples` on local.

---

## Phase 8: Academics, faculty & committees (2026-10-09, Claude)
**Status:** done
**Summary:** The four remaining Academics/IQAC routes are built: the programmes list, the programme detail page with its sticky "At a glance" card, the faculty directory with department tabs, and the session-wise committees page. All four take their content from WordPress only; nothing about a programme, a member of staff or a committee is written in the code.

**Files added**
- `app/academics/programmes/page.tsx`, `app/academics/programmes/[slug]/page.tsx`, `app/academics/faculty/page.tsx`, `app/iqac/committees/page.tsx`
- `components/academics/` — `ProgrammeGrid`, `ProgrammeGlance`, `FacultyGroups`
- `components/iqac/CommitteeAccordion.tsx`
- `components/ui/SessionSelect.tsx` (client; URL-driven session picker, reusable by any session-wise list)

**Files changed**
- `components/ui/Accordion.tsx` — new optional `titleAs` prop so an accordion title can be a real `<h2>`/`<h3>` (see "heading order" below). Default is unchanged.
- `components/cards/PersonCard.tsx` — the initials avatar now strips punctuation, so a bracketed or punctuated name still produces letters (`[SAMPLE] Faculty One` showed `[O` before).
- `lib/wp/types.ts` — `Settings.affiliation`.
- Plugin: `includes/settings.php`, `includes/rest/serializers.php`, `seed/content.php` — new `affiliation` setting; `seed/seed.php` — sample committees, more sample faculty.
- `docs/02-IMPLEMENTATION-PLAN.md` B4 — `affiliation` added to the settings field list.

**How it works**
- **Programmes list** — one `<section>` per programme level, in the order the levels appear in WordPress, each with its own H2. Two or fewer cards use a narrower two-column grid so they do not stretch.
- **Programme detail** — `generateStaticParams` from `getPaths().programmes`, `dynamicParams = true`, so a programme added in WordPress works without a redeploy. Hero subtitle is level · duration · pattern. Overview (8 cols) + sticky At-a-glance card (4 cols); then Subjects, then Career paths. Every At-a-glance row is hidden when its WordPress field is empty, so intake and fees appear only if the college fills them in. `Course` JSON-LD.
- **Faculty** — the full list is fetched once; department tabs are built from the departments that actually have people and are URL-driven (`?department=science`), so the filter is shareable. Inside each tab, staff are grouped by staff type with teaching first.
- **Committees** — session select (shown only when more than one session has committees) + one accordion per committee: purpose, convener, members table and the order PDF.

**Acceptance checklist**
- [x] Only programmes present in WordPress appear — B.A. and B.Sc., no B.Com/M.A.
- [x] Faculty without photos show initials avatars; cards in a row stay equal height (`h-full` card in a stretched grid cell) — see `faculty-1440.png` / `faculty-360.png`
- [x] Committee members table scrolls inside its own container on mobile (page `scrollWidth` stays 360); previous sessions selectable (2026-27 / 2025-26)
- [x] Part C checks empty; lint (no new warnings), `tsc --noEmit` and `next build` pass
- [x] Screenshots `docs/screenshots/phase-8/` at 360 / 768 / 1280 / 1440 for all four pages

**Banned-pattern check output:** all 8 checks empty.

**Checks run beyond the checklist**
- Every page captured at 360/768/1280/1440 reported `document.documentElement.scrollWidth` equal to the viewport width (no horizontal scroll) and a clean console (no errors or warnings).
- Structural accessibility pass on each page: exactly one `<h1>`, no skipped heading levels, every `<img>` has `alt`, every table has a caption and `scope` on its `<th>`, no link without an accessible name, `aria-current` set on the active tab and sidebar item.
- Two defects that pass found and fixed: the programmes list jumped H1 → H3 (fixed by always rendering the level H2), and committee titles were plain `<summary>` text with no heading (fixed with `Accordion titleAs="h2"`).
- `/academics/programmes/nope` returns the styled 404.

**Deviations from the plan**
1. **New `affiliation` setting.** Design system §6.4 wants "affiliating university" in the At-a-glance card, and there was no WordPress field for it; §9.10 forbids hardcoding a fact in a component. Added one text setting under "College identity" (seeded with the verified value "Govind Guru Tribal University (GGTU), Banswara") and documented it in Plan B4.
2. **Apply Now in the At-a-glance card uses the `primary` variant, not `accent`.** The sticky header already shows the gold Apply Now button, and design system §3.1 allows at most one gold-filled element per viewport.
3. **Subjects are not repeated inside the At-a-glance card.** §6.4 lists them there as well as in the Subjects grid below; showing seven subject names twice made the sticky card long without adding anything.
4. **No FAQ accordion on the programme page.** §6.4 says "only if WP has FAQs" and the content model has no FAQ field. If the college wants FAQs, they need a field in the `programs` type first.
5. **The legacy `program_department` term named "Faculty of Science" was renamed to "Science"** (slug unchanged) so the department tabs read All · Arts · Science · Administration as §6.6 requires. The name was left over from the pre-rebuild plugin.

**Seeding note:** `--samples` now also creates 4 `[SAMPLE]` committees (2026-27 and 2025-26, with convener, members and an order PDF) and 10 `[SAMPLE]` faculty instead of 4.

**Verified separately, not visible in the screenshots:** the "Download syllabus" button renders with the file type and real size, and its label reads "Download the Bachelor of Arts (B.A.) syllabus (PDF, 1 KB), opens in new tab". It was tested by attaching a sample PDF to the B.A. programme's syllabus field and then detaching it, so that no sample file stays linked to a real programme record. No programme in WordPress has a syllabus yet.

**Local-environment fix made after the phase (2026-10-09).** `includes/headless.php` now redirects `/wp-admin` to `/wp-admin/` (301). Apache and nginx add that trailing slash themselves; PHP's built-in server (`php -S`, used by the local Laragon setup) does not, so without it the browser resolved the admin menu's relative links against the site root and every menu item 404d on `/edit.php?post_type=…`. Verified with a logged-in session: `/wp-admin` → 301 → `/wp-admin/`, menu pages 200, REST unaffected.

**Open questions**
1. **Which session do the current committees belong to?** The 11 committees migrated from the old site carry no session. The API returns the latest session that has committees, so as soon as any committee is tagged with a session, untagged ones stop appearing in the default view — which is what happens on the local database now that the sample committees are seeded. Once the college confirms the session (and ideally supplies the committee orders with members), tag the 11 committees and the page is correct.
2. Faculty and staff: the real list, with designations, qualifications and photos, is still outstanding (`docs/03-CONTENT-REQUIREMENTS.md`). Until it arrives the page shows `[SAMPLE]` people.

---

## Phase 9: Campus life, news, gallery & contact (2026-10-10, Claude)
**Status:** done
**Summary:** The last build phase. News, the photo gallery with its lightbox, click-to-load videos and the contact page with a working enquiry form are built, so every link in the navigation now resolves. Two real bugs surfaced and were fixed: Next 16's image optimizer was rejecting every WordPress image in local development, and three pages had broken heading order.

**Files added**
- `app/news/page.tsx`, `app/news/[slug]/page.tsx`
- `app/campus-life/gallery/page.tsx`, `app/campus-life/gallery/[slug]/page.tsx`
- `app/contact/page.tsx`
- `components/gallery/` — `AlbumGrid`, `PhotoGrid` (client), `GalleryLightbox` (client)
- `components/page/VideoEmbed.tsx` (client) — click-to-load YouTube player
- `components/forms/` — `EnquiryForm` (client), `actions.ts` (server action), `enquiry-state.ts`

**Files changed**
- `lib/wp/html.tsx` — YouTube iframes, and YouTube links that are a paragraph on their own, now render as `VideoEmbed`. Added `youTubeId()`. Google Maps iframes are unchanged.
- `next.config.ts` — `i.ytimg.com` added for video poster frames; `dangerouslyAllowLocalIP` for a local CMS only (see below).
- `app/[...path]/page.tsx` — the enquiry form also renders below the `/admissions/apply` prose.
- `lib/wp/types.ts` (`NewsResponse`), `lib/wp/api.ts` (`getNews` returns it).
- Plugin: `includes/rest/routes.php` — `/news` returns the categories in use; `seed/seed.php` — 15 sample news items, 4 sample photo albums with generated placeholder images, and `snc_seed_sample_photo()`.
- `docs/02-IMPLEMENTATION-PLAN.md` B5 — the `/news` response shape.

**How it works**
- **News** — category tabs are built from the categories WordPress actually uses (`uncategorized` excluded), state in the URL, 12 per page. The article page shows the featured image, the prose, any attached photographs, and three more articles from the same category, with `NewsArticle` JSON-LD.
- **Gallery** — album cards link to an album page whose tiles are buttons. Clicking one opens the lightbox at that photo, with captions, a counter, arrow keys, Escape and swipe. The backdrop colour comes from the `primary-950` token through the library's own CSS variable, so no colour is written into a component.
- **Videos** — the page is ordinary WordPress content. Any YouTube embed in it becomes a poster frame with a play button; the iframe, and every Google request except the poster image, happens only after a click.
- **Contact** — address, phone and email cards come from settings and hide themselves when a field is blank. The enquiry form posts through a server action that forwards the visitor's IP so WordPress rate-limits per visitor. When the map and office hours are both unset, the form takes the full column instead of leaving an empty half.

**Acceptance checklist**
- [x] Gallery lightbox: keyboard (left/right/Esc), focus returns to the clicked tile, images lazy-loaded — all nine assertions pass (see below)
- [x] Enquiry: client and server validation, success replaces the form, failure shows the phone number; the submission appeared in wp-admin as a private `enquiry` with the right phone, programme and message
- [x] Map does not load until near the viewport (`loading="lazy"`) — **not visible on the live site yet**, because `map_embed_url` is still blank in settings
- [x] Part C checks empty; lint (no new warnings), `tsc --noEmit` and `next build` pass
- [x] Screenshots `docs/screenshots/phase-9/` at 360 / 768 / 1280 / 1440, plus the open lightbox at 1440 and 360

**Banned-pattern check output:** empty except the one line Part C explicitly allows —
`components/forms/EnquiryForm.tsx:188: <Loader2 … className="motion-safe:animate-spin" />` (the submit-button spinner, wrapped in `motion-safe:` as required).

**Automated checks run**
- *Lightbox* (headless Chrome): tiles render; photos lazy-loaded; a click opens the lightbox; it opens on the clicked photo (3/5); ArrowRight moves to 4/5; ArrowLeft back to 3/5; the caption matches; Escape closes it; focus returns to the tile that was clicked. All pass.
- *Enquiry form* (headless Chrome): the honeypot is present and `aria-hidden`; a 5-digit mobile is refused by the browser before submission; a valid enquiry returns the success panel and replaces the form; with WordPress unreachable the form shows "Your enquiry could not be sent, or call +91 94143 52319" and never a fake success. All pass. Both test records were deleted afterwards.
- *Accessibility*, all seven pages: one `<h1>`, no skipped heading levels, every image has `alt`, no link without an accessible name.
- Every page at 360/768/1280/1440: no horizontal scroll, clean console.

**Two bugs found and fixed**
1. **Every WordPress image failed to load in local development.** Next 16's image optimizer refuses an upstream image whose host resolves to a private IP (SSRF protection), and the local CMS is `http://localhost:8881`, so each one returned 400 with `"url" parameter is not allowed`. Nothing caught it earlier because the gallery was the first page with WordPress-hosted images. `next.config.ts` now sets `images.dangerouslyAllowLocalIP` **only when `WORDPRESS_URL` points at localhost**, so it turns itself off on a real CMS host and never ships to production.
2. **Heading order broke on `/news`, `/campus-life/gallery` and `/contact`** — an `<h1>` followed straight by the cards' `<h3>`. The design shows no visible heading in those places, so each page now carries a screen-reader-only `<h2>` ("All news" or the category name, "Photo albums", "Contact details").

**Deviations from the plan**
1. **`/news` returns the categories in use**, mirroring what `/notices` already does for its types, so the tabs are data-driven rather than a hardcoded list of category names. Plan B5 updated.
2. **The enquiry form's programme options come from the `programs` content type** rather than the literal "B.A. / B.Sc. / Other" in design system §5.20, because a fixed programme list in a component would be a hardcoded fact (§9.10). "Other" is kept as the last option.
3. **A YouTube link becomes a player only when it is the entire paragraph.** A link inside a sentence stays a link — turning every mention of a video into a full-width player would wreck running text.

**Verified with temporary content, then reverted**
The college has supplied no videos, so the Videos page holds only a link to their YouTube channel (a channel URL, which correctly stays a plain link). To test the player, a YouTube embed and a standalone video link were added to that page, confirmed to render as click-to-load posters with no `<iframe>` in the delivered HTML, captured as `videos-click-to-load-*.png`, and the original page content was then restored. **Those screenshots show test content that is not on the site.**

**Open questions**
1. **`wp_mail()` does not work on this machine, so the enquiry notification email is unverified.** It fails with `Invalid address: (From): wordpress@localhost` and there is no SMTP server on localhost:25. The enquiry itself is stored correctly and the visitor still sees the honest success, so nothing is lost — but **if mail also fails in production the college will never be told an enquiry arrived.** Phase 10 should configure SMTP (or an SMTP plugin) and send a real test. A daily digest of new enquiries would be a sensible backstop.
2. The gallery shows generated placeholder images, not photographs. Real campus photographs are content requirement item 4.
3. `map_embed_url`, `map_link` and `office_hours` are still blank, so the map panel, the "Get directions" link and the office-hours card do not render. They appear as soon as the college supplies them — no code change needed.

---

## Phase 10: SEO, redirects, QA & launch (2026-10-10, Claude)
**Status:** blocked — the engineering work is done; the remaining items need the college (content) and a production environment. See "What is left" at the end.

**Summary:** Redirects, sitemap and robots are in place, every route has unique metadata and a share image, and the Lighthouse pass is done. Two performance bugs were found and fixed; the biggest was a 745 KB favicon that was being downloaded on every page view and dragging performance down to 66.

**Files added:** `app/sitemap.ts`, `app/robots.ts`, `app/icon.png`, `app/apple-icon.png`
**Files changed:** `next.config.ts` (34 legacy redirects + media-host rule), `app/layout.tsx` (site-wide Open Graph defaults from settings; Merriweather 700 only), `docs/01-DESIGN-SYSTEM.md` §3.2 (font weight note)
**Files removed:** `public/favicon.ico`

**Acceptance checklist**
- [x] **Every old URL in design system §7.3 returns 301 to the right page — 34/34**, verified by chasing each redirect to a 200 and checking every hop is permanent. `/wp-content/uploads/:path*` keeps pointing at the WordPress media host, so old PDF links survive.
- [x] **Lighthouse mobile: Performance 94–95, Accessibility 100, Best Practices 100, SEO 100** on all eight audited pages. Scores below.
- [x] Zero console errors on every audited page, at 360 px and 1280 px, with no horizontal scroll.
- [x] Unique `<title>`, meta description and canonical on all 61 routes; all 61 carry an Open Graph image once a default is set in settings (verified by setting one temporarily).
- [ ] **Zero `[SAMPLE]` content** — not yet; this is a content task for the college, not a code task. Counts below.
- [ ] **Owner sign-off** — pending.

**Lighthouse mobile (production build, `next start`, simulated slow 4G + 4× CPU)**

| Page | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|------|-----|------|-----|-----|-----|-----|-----|
| Home | 94 | 100 | 100 | 100 | 3.0 s | 0 | 100 ms |
| Section page (`/about/vision-mission`) | 95 | 100 | 100 | 100 | 2.9 s | 0 | 50 ms |
| Merit lists | 94 | 100 | 100 | 100 | 2.9 s | 0 | 110 ms |
| Notices | 95 | 100 | 100 | 100 | 2.9 s | 0 | 110 ms |
| Programme detail (B.A.) | 95 | 100 | 100 | 100 | 2.9 s | 0 | 90 ms |
| Faculty | 95 | 100 | 100 | 100 | 2.9 s | 0 | 50 ms |
| Gallery album | 94 | 100 | 100 | 100 | 3.1 s | 0 | 40 ms |
| Contact | 95 | 100 | 100 | 100 | 2.9 s | 0 | 50 ms |

Design system §10 targets are met except **LCP, which is 2.9–3.1 s against a < 2.5 s budget.** What remains is the web-font swap: first paint is fast (FCP 0.9 s, Speed Index 0.9 s) and the LCP element is heading or body text that repaints when Merriweather arrives. This was measured against `next start` on a development laptop with no CDN and no edge compression, so **re-measure on production hosting before treating it as a real miss**; if it persists, the lever is the serif font (self-host a subset, or use the sans for the hero text).

**Two performance bugs found and fixed**
1. **`public/favicon.ico` was a 745 KB JPEG** — a byte-identical copy of `emblem.jpg` (1024×1024, 300 DPI) renamed to `.ico`. Browsers fetch the favicon on every page, so this was two-thirds of the 1,124 KiB page weight and starved the real assets on a throttled connection. Replaced with `app/icon.png` (48×48, **2.7 KB**) and `app/apple-icon.png` (180×180, 21 KB), both generated from the emblem with sharp. **This one change moved every page from 66–92 to 93–95 and cut LCP from 6.8–7.4 s to ~3.1 s.**
2. **Merriweather weight 900 was downloaded but never used.** Nothing in the codebase uses `font-black`, and §3.2 bans it outside an optional hero title. Dropping it removed ~48 KB from every page. Design system §3.2 updated so the two do not drift apart.

**Before/after, mobile Performance:** home 66 → 94 · section 70 → 95 · merit lists 91 → 94 · notices 88 → 95 · programme 75 → 95 · faculty 75 → 95 · album 92 → 94 · contact 76 → 95.

**SEO**
- `app/sitemap.ts` lists **61 URLs** — code routes, every navigation target, and all WordPress pages, programmes, news items and albums from `/paths`. It rebuilds itself as content is added.
- `app/robots.ts` allows everything except `/styleguide` and `/api/`, and points at the sitemap.
- Open Graph now has a site-wide default in the root layout (type, locale, `siteName` and the image from settings). Pages that set their own `openGraph` already fall back to `default_og_image` themselves. **Nothing will carry a share image until the college supplies one** (SNC Settings → Search & sharing).

**Checks run**
- 34/34 legacy redirects, each chased to a 200 with every hop permanent.
- Metadata across all 61 routes: no missing titles, descriptions or canonicals; no duplicates except the 15 sample news articles, which share a description only because the seed gives them identical body text — real posts get their own excerpt.
- `robots.txt` and `sitemap.xml` fetched and inspected.
- Revalidation endpoint: valid secret 200, wrong secret 401, GET 405.
- WordPress still sends `X-Robots-Tag: noindex`; `autologin.php`, `auto-login-link.txt` and `setup_wp.php` are absent from the repository.
- Banned-pattern checks: all empty except the permitted `motion-safe:animate-spin` in `EnquiryForm.tsx`.
- lint, `tsc --noEmit` and `next build` pass.

**Remaining `[SAMPLE]` content (local database; run the seed without `--samples` on production)**

| Content type | Sample items |
|---|---|
| Notices | 26 |
| Merit lists | 60 |
| Documents | 16 |
| Faculty & staff | 10 |
| Committees | 4 |
| News | 15 |
| Photo albums | 4 (with generated placeholder images) |
| Programmes, leadership messages, settings | none — all real |

The faculty qualifications contain the strings "B.Com.", "M.A." and "M.Sc.", which look like unoffered programmes to a naive grep; they are **staff qualifications**, not programmes, and they disappear with the sample data.

**What is left, and who it needs**
1. **The college** — replace every `[SAMPLE]` item above; supply real photographs, the official logo, the default share image, the Google Maps pin, office hours, the Principal's name and photo, and the confirmed programme list. Confirm the facts still marked "confirm" in design system §8.3: the founder's name spelling ("Prashant" vs "Prasshant"), NAAC status, the AISHE code, and the Instagram/YouTube handles.
2. **Production environment** (cannot be done from here) — set `WORDPRESS_URL`, `NEXT_PUBLIC_SITE_URL` and `REVALIDATE_SECRET`; point `SNC_FRONTEND_URL` at the live site; set `WP_DEBUG` to false; re-test revalidation end to end; confirm the CMS stays `noindex`; configure backups for the WordPress database and uploads.
3. **SMTP** — `wp_mail()` does not work locally (Phase 9 open question). Configure real mail and send a test enquiry, or the college will never be told one arrived.
4. **Cross-browser** — only Chromium browsers (Chrome, Edge) are installed on this machine. **Firefox, Safari/iOS and Samsung Internet have not been tested**, including the mobile action bar's iOS safe-area inset. These need a real device or a service like BrowserStack.
5. **Re-measure LCP on production hosting** against the < 2.5 s budget.

---

### Post-Phase-10 fix: container width and the header overlap (2026-10-10, owner-reported)

**Reported:** the nav menu was sitting on top of the college name in the header, and the page left too much empty space at the left and right.

**Both had one cause.** `<Container>` was capped at `max-w-7xl` (1280px). On a 1536px-wide viewport that left ~128px of empty margin per side — and at the `2xl` breakpoint the header re-shows the "· Affiliated to GGTU, Banswara" line (a Phase 2 decision), which widened the brand block inside a box that never grew. The brand flex item shrank below its content, and because the college name is `whitespace-nowrap` the text overflowed its clipped box by 24px, landing under "HOME".

Measured before the fix, at the brand text rather than its box:

| Viewport | Name box | Name text | Overflow | Nav starts | Result |
|---|---|---|---|---|---|
| 1280 | 274 | 274 | 0 | 398 | ok |
| 1440 | 274 | 274 | 0 | 478 | ok |
| **1536** | 250 | 274 | **24** | 494 | **collides** |
| **1920** | 250 | 274 | **24** | 686 | **collides** |

**Fix:** container widened to **90rem / 1440px** via a new `--container-8xl` token in `@theme`; `Container` now uses `max-w-8xl`. Design system §4.2 updated so the document and the code agree.

**After:** no overflow at any width from 1280 to 2560 (132px of clear space between brand and nav at 1536+), and the side gutter at 1536 drops from 128px to 48px.

| Viewport | Container | Side gutter | Brand → nav gap |
|---|---|---|---|
| 1280 | 1280 | 0 | 24px |
| 1536 | 1440 | 48 | 132px |
| 1920 | 1440 | 240 | 132px |

**Regression checks:** console clean and no horizontal scroll on all eight audited pages at 360px and 1280px; heading order and alt text unchanged; Lighthouse home unchanged at 94 / 100 / 100 / 100, LCP 3.0s, CLS 0. Running text is unaffected because `.prose-snc` still caps paragraphs at 65ch, so the wider container does not lengthen reading lines.

**Note:** the Phase 2 through Phase 9 screenshots were taken at the old 1280px container and no longer match the current layout. `docs/screenshots/phase-10/*-wide-1536.png` show the current state.

---

## Phase 10 follow-up — Navigation restructured to the college's own menu — 2026-10-10 — Claude
**Status:** done
**Requested by:** the owner, with screenshots of the snccollegedpr.in menu ("the nav menu should be this").

**Summary:** The primary navigation now follows the college's existing menu (HOME · ABOUT · ACTIVITIES · COURSES · SCHOLARSHIP · STUDENT CORNER · GALLERY · CONTACT US) instead of the regrouped IA of design system §7.2. No routes were added, removed or renamed, so §7.1 and the §7.3 redirects are untouched — this is purely a change of labels and grouping in `config/navigation.ts`. Eight uppercase top-level items no longer fit beside the brand block at 1280 px, so the nav tightens its padding and tracking between `xl` and `2xl`. Fixing the mobile drawer (below) was required to verify the new menu at 360 px.

**Files changed:**
- `config/navigation.ts` — rewritten `mainNav`; `getSectionForPath` now picks the **longest** matching href (otherwise `/campus-life/gallery` resolved to Activities, not Gallery); `getSectionRoot` only treats an item with a menu as a section root (otherwise `/admissions/scholarships` lost its section sidebar); new `pathOf()` so a menu href may carry a query string; `footerQuickLinks` relabelled to match the new menu and extended with Merit Lists.
- `components/layout/DesktopNav.tsx` — `px-1.5 2xl:px-3`, `tracking-normal 2xl:tracking-wide`, list `gap-0 2xl:gap-1`; active underline inset follows the padding.
- `components/layout/BrandMark.tsx` — college name `xl:text-[15px] 2xl:text-lg`.
- `components/layout/MobileNav.tsx` — drawer moved into a `createPortal` to `<body>` (bug fix, see below).
- `app/sitemap.ts` — strips the query string off a menu href before indexing it.

**Menu as built** (routes unchanged):

| Item | href | Menu |
|---|---|---|
| Home | `/` | — |
| About | `/about` | About SNC · Message · Infrastructure · College Committee (`/iqac/committees`) · Affiliations · Our Values (`/about/vision-mission`) · Pragati Sansthan |
| Activities | `/campus-life` | wide, 2 columns: Support & Guidance · IQAC · Student Grievance Redressal Cell · Mandatory Disclosures · Examination Section · UGC / Statutory Bodies Compliance ‖ NAAC · Placement Cell · Anti-Ragging Committee & Undertaking · Faculty / Staff Details · Academic Calendar · Reports (AQAR / AISHE) |
| Courses | `/academics/programmes` | — |
| Scholarship | `/admissions/scholarships` | — |
| Student Corner | `/students` | Admission · Admission Form · Merit Lists · Notices · Syllabus · Old Question Papers · Migration Nodal · Downloads · Admission Kit & Dress Code |
| Gallery | `/campus-life/gallery` | Photo Gallery · Video Gallery · Press Note (`/news?category=press-notes`) · Alumni · News & Events |
| Contact Us | `/contact` | — |

**Bug found and fixed (pre-existing, Phase 2):** the mobile drawer was clipped to the 64 px header. `SiteHeader` uses `backdrop-blur`, and an element with a backdrop-filter becomes the containing block for `position: fixed` descendants, so the drawer's `fixed inset-0` resolved against the header instead of the viewport — the nav list rendered at zero height and the Apply/Call/WhatsApp buttons spilled over the page. Measured before: drawer height 64 px, nav height 0, 8 list items present but invisible. After portalling the drawer to `<body>`: drawer 780 px, nav 575 px, all 8 items visible. Phase 2's drawer checklist item was ticked in error.

**Acceptance checks:**
- [x] 1280 px: all 8 items + Apply Now on one line, 55 px clear between the brand and HOME, no overlap
- [x] 1440 / 1536 px: full `2xl` spacing and the full brand subtitle return
- [x] 1024 / 768 px: hamburger only, no desktop nav
- [x] No horizontal overflow at 360 / 768 / 1024 / 1280 / 1440 / 1536 (`scrollWidth` == viewport minus scrollbar at every width)
- [x] Mega menus open on click and stay inside the container (the 720 px Activities panel ends at 1215 px of 1248)
- [x] Mobile drawer: 8 top-level rows, accordion chevrons on the five items with menus
- [x] All 39 routes reachable from the menu return 200
- [x] Breadcrumbs follow the new grouping: `/iqac/naac` → Home › Activities › NAAC; `/iqac/committees` → Home › About › College Committee; `/students/syllabus` → Home › Student Corner › …; `/campus-life/gallery`, `/admissions/scholarships`, `/academics/programmes` are top-level, so Home › page
- [x] Section sidebars render for pages inside a menu; Scholarship and Courses keep their own page template
- [x] `npm run lint` (only the pre-existing `postcss.config.mjs` warning), `npx tsc --noEmit`, `npm run build` all pass

**Banned-pattern check output:** checks 1–4 and 6–8 empty. Check 5 prints only the documented exception, `EnquiryForm.tsx:188` `motion-safe:animate-spin`.

**Screenshots:** `docs/screenshots/phase-10-nav/` — header-360, header-1280, header-1440, mega-about-1280, mega-activities-1280, mega-student-corner-1280, mega-gallery-1280, mobile-drawer-360.

**Deviations from the design system** (all caused by adopting the college's menu; §7.2 and §5.5–5.6 otherwise stand):
1. **§7.2 primary navigation replaced.** The documented IA (ABOUT · ACADEMICS · ADMISSIONS · STUDENTS · CAMPUS LIFE · IQAC) is not what the college uses. Governance items (NAAC, IQAC, mandatory disclosures) are back under "Activities" and admissions items under "Student Corner" — the two groupings §2.2 called out as problems on the old site. Done at the owner's explicit request.
2. **Eight top-level items, not seven** (§5.5). Contact Us is a nav item rather than replacing Home, because the college's menu carries both.
3. **Apply Now kept as the gold accent button.** The college's menu puts CONTACT US in that slot. The owner's answer to this question did not come through legibly, so the §5.5 default was kept: Apply Now stays gold, Contact Us is the eighth nav item. One-line change in `SiteHeader.tsx` + `navigation.ts` if the owner wants the button to be Contact Us instead.
4. **Twelve links in the Activities menu**, over the §5.6 limit of ten. It is the wide two-column variant, six per column, which is how the college's own menu renders it.
5. **No third level under "Our Values".** The college's menu flies out to Vision & Mission / Ladder of Success / Philosophy; §5.6 bans a third level and all three live on the one `/about/vision-mission` page, so it is a single link.
6. **Nav padding and tracking tightened at `xl`** (§5.5 specifies `px-3`, §3.2 `tracking-wide`). Full values return at `2xl`. Without this the eight longer labels overlap the college name at 1280 px.
7. **Seven pages the college's menu has no slot for were added to the nearest dropdown** (owner's choice): Merit Lists, Notices, Downloads and Admission Kit → Student Corner; Reports (AQAR / AISHE) → Activities; Pragati Sansthan → About; News & Events → Gallery.

**Open questions:**
1. Should the header's gold button be **Contact Us** (matching the college's menu exactly) or stay **Apply Now**? Currently Apply Now — see deviation 3.
2. `/academics` (the Academics landing page in WordPress) is now linked from nowhere, because the college's menu has no "Academics" item; "Courses" points straight at `/academics/programmes`. Leave it unlinked, delete it, or point Courses at it?
3. `/news` now breadcrumbs as Home › Gallery › News & Events, which reads oddly. It follows from putting News under the Gallery menu; moving it elsewhere means adding an item the college's menu does not have.

---

## Phase 10 follow-up — Official logo + "What People Say About Us" — 2026-10-10 — Claude
**Status:** done for engineering; **blocked on the college for the real Google reviews and rating.**
**Requested by:** the owner — "this is the correct logo … hardcode it (clicking it should redirect on our homepage), but it should be able to change from wp backend admin", and "add this section in homepage - What People Say About Us … reviews from google about the college".

### 1. Official logo

The emblem from `https://snccollegedpr.in/wp-content/uploads/2025/06/SNC_Logo.png` (638 × 636, transparent RGBA) is now bundled at `frontend/public/images/logo.png` and is the default everywhere. **SNC Settings → College identity → College logo** overrides it without a redeploy; the frontend falls back to the bundled file whenever that setting is empty, so the site is never without a logo. This closes the ★ "official logo files" blocker in design system §8.4 for the PNG (a transparent **SVG** is still worth asking for).

- The logo links to `/` from the header (it already did — `BrandMark` wraps emblem + name in one `next/link`), and in the footer and the mobile drawer it is decorative beside text that links.
- `rounded-full` was dropped in favour of `object-contain`: the new emblem is a round design on a transparent square canvas, so clipping it to a circle cut the edge of the seal.
- Favicons regenerated from the same file (`app/icon.png` 48 px, `app/apple-icon.png` 180 px), rendered with headless Chrome on a transparent background — no image library was added, so the Plan A2.7 dependency list is unchanged.
- The old `public/images/emblem.jpg` (a different, navy-and-gold seal) is deleted and no longer referenced anywhere.

**Files:** WP — `includes/settings.php` (`logo_id`, image picker), `includes/rest/serializers.php` (`logo` in the settings payload). Frontend — `config/site.ts` (`siteConfig.logo` + `logoSrc()`), `lib/wp/types.ts` (`Settings.logo`), `components/layout/BrandMark.tsx`, `MobileNav.tsx`, `SiteFooter.tsx`, `components/home/StaticHero.tsx`, `app/page.tsx` (JSON-LD `logo`), `app/icon.png`, `app/apple-icon.png`, `public/images/logo.png`.

### 2. "What People Say About Us"

`components/home/TestimonialsSection.tsx` was rewritten from the three-card "What our students say" grid into the reviews section the owner sketched: a navy rating panel on the left (score, stars, a white Google chip with the review count, "Read all reviews on Google") and the heading plus up to four review cards on the right. It uses the standard 12-column split of §4.4 and stacks to one column below `lg`.

Deliberately **not** copied from the owner's reference image: its green background and its carousel. Design system §3.1 allows only navy and gold on neutrals, and §5.15 bans auto-scrolling content. The reference was supplied for structure, not styling.

**Where the numbers come from.** Everything is editable in WordPress and nothing is hardcoded:

| Shown | Source |
|---|---|
| Score ("4.2"), "87 reviews", link to the listing | SNC Settings → **Reviews** (`google_rating`, `google_review_count`, `google_reviews_url`) |
| Each review: name, text, stars, date, link to the original | The **Reviews** post type (formerly "Testimonials"), one post per review |

The Reviews post type gained `snc_source` (college / Google), `snc_rating`, `snc_review_date` and `snc_review_url`; `snc_consent` is now labelled "Cleared to publish" and still gates every review. A `select` renderer was added to the shared admin field registry to support these.

**Gating:** the homepage omits the whole section unless a Google score is set or at least one review is published. With reviews but no score, the rating panel is dropped and the cards span the full width.

**Google mark:** `GoogleIcon` in `components/icons/social.tsx`, four paths in Google's own brand colours, which are new tokens (`--color-google-blue/red/yellow/green`) so that no hex reaches a component — the same approach as the existing `whatsapp` token. Google's brand terms do not allow a recoloured or monochrome "G".

**Files:** WP — `includes/meta.php` (review fields), `includes/settings.php` (Reviews section), `includes/rest/serializers.php`, `includes/admin/fields.php` (`select` renderer), `seed/seed.php` (four `[SAMPLE]` reviews). Frontend — `components/home/TestimonialsSection.tsx`, `components/cards/TestimonialCard.tsx`, `components/ui/StarRating.tsx` (new), `components/icons/social.tsx`, `app/globals.css`, `app/page.tsx`, `app/styleguide/page.tsx`, `lib/wp/types.ts`.

### Content still needed from the college (blocker)

**No real review is published, and none was invented** (design system §8.2). The section currently shows four `[SAMPLE]` reviews from `seed --samples` and no rating panel. To go live the college must supply, from its own Google Business listing:

1. the score as Google shows it, and the number of reviews;
2. the "Share" link of the listing;
3. for each review to feature: the reviewer's name exactly as it appears, the review text, the star rating, the date, and the permalink to that review.

A `4.2 / 87 reviews` value was set in the database for ten minutes to photograph the layout and then **cleared**; the settings are empty again. Added to `docs/03-CONTENT-REQUIREMENTS.md`.

Two things for the owner to decide, in Open questions below: whether to pull reviews automatically from the Google Places API instead of pasting them (needs a billed Google Cloud key, and Places returns at most five reviews), and whether reproducing review text on the site is acceptable to them — it is the college's own listing, so attribution plus a link to the original is the normal practice, which is what this implements.

**Acceptance checks:**
- [x] Logo renders in the header, mobile drawer, footer and static hero; the header block links to `/`
- [x] `logo` is `null` in `/snc/v1/settings` with nothing set, and the bundled file is used; setting the field in WordPress overrides it
- [x] Favicons are the new emblem, transparent, 48 px and 180 px
- [x] Reviews section matches the requested arrangement at 1280 px and stacks at 390 px, no horizontal overflow
- [x] Stars read fractionally (4.2 draws a one-fifth-filled fifth star); `sr-only` text states the number
- [x] Section is omitted with no score and no reviews; rating panel is omitted with reviews but no score
- [x] `npm run lint` (only the pre-existing `postcss.config.mjs` warning), `npx tsc --noEmit`, `npm run build` all pass
- [ ] Real Google reviews and rating entered — **blocked on the college**

**Banned-pattern check output:** checks 1–4 and 6–8 empty. Check 5 prints only the documented exception, `EnquiryForm.tsx:188` `motion-safe:animate-spin`.

**Screenshots:** `docs/screenshots/phase-10-nav/` — logo-header-1280, reviews-1280, reviews-390.

**Deviations from the design system:**
1. **§6.1 / §5.13 "What our students say" is now "What People Say About Us"** and carries a Google rating panel, at the owner's request. The card itself still follows §5.13; it gained a star row and a Google link.
2. **Four new colour tokens** for the Google mark (§3.1 lists the palette). They are used only inside `GoogleIcon`, and only because Google's brand terms forbid recolouring the mark — the same reason the `whatsapp` token exists.
3. **The emblem is no longer `rounded-full`** (§5.5 says "the round SNC seal"). The supplied PNG is already round on a transparent canvas, so a circular clip cut into the artwork.
4. **The homepage gate for the section is "a score or ≥ 1 review"**, not "≥ 3 testimonials" as in §6.1, because a Google rating alone is worth showing.

**Open questions:**
1. Owner: should reviews be pasted into WordPress by hand (as built), or pulled automatically from the **Google Places API**? The API needs a billed Google Cloud key in `.env.local`, returns at most five reviews, and requires the Google attribution and a link — tell me and I will add it.
2. Owner: a transparent **SVG** of the emblem, if the college has one, would render more sharply than the 638 px PNG at the 288 px hero size.
3. ~~Owner: the new emblem's motto reads "तमसो मा ज्योतिर्गमय", while design system §8.3 records the motto as "Vidya Vinayen Shobhate" from the older seal. Which is current?~~ **Answered 2026-10-10:** "तमसो मा ज्योतिर्गमय". Design system §8.3 corrected and the "At a glance" list on `/about` updated (`seed/content.php`). It is set upright, not italic: the Devanagari fallback fonts have no true italic and the browser's synthesised slant is unreadable at body size.

---

## Phase A — Orientation and baseline — 2026-10-10 — Antigravity
**Status:** done
**Summary:** Verified the entire local stack and baseline quality gates before starting any feature work. WordPress (Laragon PHP 8.3 built-in server on port 8881) and Next.js frontend (port 3000) are both running and returned 200 on `/`, `/about`, `/admissions/merit-lists` and `/contact`. Visual verification captured the homepage at 360, 768, 1280 and 1440 px with zero horizontal overflow. All three quality gates (lint, tsc, build) and all eight Part C banned-pattern checks are completely clean.
**Files changed:** none (orientation and baseline verification only).
**Acceptance checklist:**
- [x] Start WordPress and the frontend; confirm `/`, `/about`, `/admissions/merit-lists` and `/contact` return 200
- [x] Set up the `visual-verification` skill and capture the homepage at 360, 768, 1280 and 1440 px; confirm no horizontal overflow at any width
- [x] Run the three quality gates and the eight Part C greps; confirm they are clean before changing anything
- [x] Read the two "Phase 10 follow-up" entries in `docs/PROGRESS.md` (navigation structure and portalled mobile drawer; neither will be "fixed")
**Quality gates output:**
- `npm run lint`: 0 errors, 1 pre-existing warning (`postcss.config.mjs`)
- `npx tsc --noEmit`: 0 errors
- `npm run build`: compiled successfully, generated 69/69 static pages, exited code 0
**Banned-pattern check output:**
- Checks 1–4, 6–8: completely clean (zero output)
- Check 5: `components/forms/EnquiryForm.tsx:188: {isPending && <Loader2 aria-hidden="true" size={18} strokeWidth={2} className="motion-safe:animate-spin" />}` (the explicitly documented and permitted exception)
**Screenshots:**
- `docs/screenshots/phase-A/home-360.png` (docW 360, winW 360)
- `docs/screenshots/phase-A/home-768.png` (docW 753, winW 768)
- `docs/screenshots/phase-A/home-1280.png` (docW 1265, winW 1280)
- `docs/screenshots/phase-A/home-1440.png` (docW 1425, winW 1440)
**Deviations from plan:** none
**Open questions:** unchanged from Phase 10 follow-up (see Open questions list below).

---

## Phase B — Close the open decisions — 2026-10-10 — Antigravity
**Status:** done
**Summary:** Clarified and closed the three owner questions blocking tidy-up from Phase 10 follow-up. The owner confirmed: (1) keep the gold "Apply Now" button and keep "Contact Us" as the 8th navigation item; (2) leave `/academics` unlinked and accessible by direct URL while "Courses" continues pointing directly to `/academics/programmes`; (3) keep "News & Events" under the "Gallery" menu with breadcrumbs "Home › Gallery › News & Events".
**Files changed:** `docs/PROGRESS.md`
**Acceptance checklist:**
- [x] Header button: owner decision confirmed (keep Apply Now + Contact Us as 8th item)
- [x] `/academics`: owner decision confirmed (leave unlinked, Courses points to programmes)
- [x] `/news` breadcrumbs: owner decision confirmed (keep under Gallery)
- [x] Answers recorded into the "Decisions" section and questions closed in "Open questions"
**Quality gates output:**
- `npm run lint`: 0 errors, 1 pre-existing warning (`postcss.config.mjs`)
- `npx tsc --noEmit`: 0 errors
- `npm run build`: verified in Phase A
**Banned-pattern check output:** all 8 checks clean (same baseline as Phase A).
**Screenshots:** not applicable (no layout or visual changes).
**Deviations from plan:** none.

---

## Phase F — Accessibility, QA & interaction re-pass — 2026-10-10 — Antigravity
**Status:** done
**Summary:** Re-verified accessibility, responsive geometry, keyboard interactions, and console hygiene across all eight audited pages (`/`, `/about/vision-mission`, `/admissions/merit-lists`, `/students/notices`, `/academics/programmes/ba`, `/academics/faculty`, `/campus-life/gallery/sample-annual-function`, `/contact`) at both 360 px and 1280 px using Chrome DevTools Protocol. All 16 viewports passed with zero horizontal overflow, zero console errors, exactly one `<h1>` per page, zero heading hierarchy violations, zero missing image `alt` attributes, and zero missing link accessible names. Interactive components (desktop mega menu, portalled mobile drawer, merit lists filter dropdowns, and enquiry form validation) were tested and verified operational.
**Files changed:** none (automated testing and verification pass).
**Acceptance checklist:**
- [x] Full accessibility and structure audit on the eight audited pages at 360 px and 1280 px
- [x] Confirm zero console errors on every audited page at 360 and 1280 px (16/16 clean)
- [x] Confirm zero horizontal overflow at 360 and 1280 px (16/16 clean)
- [x] Heading hierarchy and accessible names verified (1 H1 per page, 0 heading skips, all images have alt)
- [x] Interactive keyboard / state pass on MegaMenu, Mobile Drawer, Merit List filters, and Enquiry Form
- [x] Quality gates: lint (0 errors, 1 pre-existing warning) and `tsc --noEmit` (0 errors)
**Audit results (360 px and 1280 px):**

| Page | 360px Overflow | 1280px Overflow | H1s | Heading Skips | Missing Alt | Console Errors |
|---|---|---|---|---|---|---|
| Home (`/`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |
| Section (`/about/vision-mission`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |
| Merit lists (`/admissions/merit-lists`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |
| Notices (`/students/notices`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |
| Programme detail (`/academics/programmes/ba`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |
| Faculty (`/academics/faculty`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |
| Gallery album (`/campus-life/gallery/...`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |
| Contact (`/contact`) | false (360/360) | false (1265/1280) | 1 | 0 | 0 | 0 |

**Interactive component test results:**
- Desktop MegaMenu (1440px): `aria-expanded="true"`, panel visible, focus management active
- Mobile Drawer (360px): `role="dialog"`, `aria-label="Menu"`, locks body scroll, trapped focus, close button operable
- Merit List filters: 3 select dropdowns active, table updates dynamically
- Contact Enquiry Form: 10 form controls with associated labels, honeypot present, submit button active
**Banned-pattern check output:** all 8 checks clean.
**Deviations from plan:** none.

---

## Phase C (part 1 of 2) — Sample-removal tooling — 2026-10-12 — Claude
**Status:** blocked on the college for the content itself; the tooling step is done.

**Summary:** Phase C step 4 ("delete sample records as real ones replace them") had no safe
mechanism. The only bulk delete was `--reset`, which empties the SNC content types entirely
and would destroy anything the office had already entered in wp-admin. Added
`--purge-samples` to the seeder: it deletes only records whose title starts with `[SAMPLE]`,
plus the PDFs and placeholder photos generated for them, and seeds nothing. `--dry-run` lists
the matches without deleting. No content was invented, written or changed by this work — it
only removes.

The purge was run for real against the local database to prove it, then the samples were
re-seeded, because the college's content has not arrived and local testing still needs them.
Local data is back to its exact pre-purge state.

**Files changed:**
- `wp-content/plugins/snc-core-headless/seed/seed.php` — new `snc_seed_purge_samples()`;
  `snc_seed_cli()` handles `--purge-samples` / `--dry-run`; header docblock updated
- `wp-content/plugins/snc-core-headless/seed/run.php` — same two flags for the non-WP-CLI runner
- `.agents/rules/40-wordpress-plugin.md` — new "Removing the samples" section
- `docs/PROGRESS.md` — this entry

**Why the purge queues its own cache tags:** `includes/revalidate.php` hooks `deleted_post`,
but that fires *after* the row is gone, so `get_post()` returns null and the post type cannot
be resolved — a hard delete revalidates nothing. The purge therefore collects the tags for
every affected post type *before* deleting and calls `snc_queue_revalidate()` itself. This was
confirmed end to end: `debug.log` recorded
`revalidate notices,home,committees,documents,faculty,gallery,paths,merit-lists,news,testimonials → 200`
and the frontend went from samples to empty states without a restart. The general hook is left
alone; deleting from wp-admin goes through `trashed_post` first, which already works.

**Acceptance checklist (Phase C):**
- [x] 1. A single short request document for the college exists — `docs/COLLEGE-CONTENT-REQUEST.md` (prepared earlier)
- [ ] 2. Real content entered in wp-admin — **blocked:** nothing has been supplied yet
- [~] 3. Design system §8.3 "confirm" rows — founder spelling, AISHE code, programme list, NAAC
      and the motto are all answered in Decisions below. **Still open: the Instagram and YouTube
      handles, and the NAAC grade and year** (the owner confirmed accreditation but not the details,
      so nothing is published)
- [x] 4. A way to delete sample records as real ones replace them — `--purge-samples`, verified below
- [ ] "Done when": zero `[SAMPLE]` across the `snc/v1` endpoints — **demonstrated, not yet permanent.**
      The purge produced exactly that state; the samples were then restored because the real
      content is not here. This box closes when step 2 does.

**Verification run (local, 2026-10-12):**
- Database backed up first to `d:\singularitylabs\SNC_db_backup_before_phaseC_purge_2026-10-12.sql`
  (outside the repository), 390 KB.
- `php -l` clean on both changed PHP files.
- `--purge-samples --dry-run` matched 268 records and listed all 139 post titles; **0 of them
  lacked the `[SAMPLE]` prefix**: 26 circulars, 60 merit_lists, 16 documents, 10 faculty_staff,
  4 committees, 15 posts, 4 testimonials, 4 gallery, 129 attachments. This matches the sample
  inventory in `antigravity.md` Phase C exactly.
- `--purge-samples` for real: real content untouched — 11 committees, 2 leaders, 2 programmes
  and 33 pages all survived; `find wp-content/uploads -iname "*sample*"` returned nothing, so no
  orphaned files were left on disk.
- All 12 `snc/v1` endpoints returned HTTP 200 with **zero** `[SAMPLE]` occurrences, while
  `/settings`, `/home`, `/programmes`, `/committees`, `/leaders` and `/paths` stayed populated.
- 10 frontend pages returned 200 with zero `[SAMPLE]`, rendering empty states — the homepage
  fell back to `StaticHero` with the Notice Board reading "No notices have been published yet",
  and `/students/notices` showed "No notices published yet". No placeholder rows anywhere.
- No horizontal overflow on the empty pages: 360 px → docW 360/winW 360; 1280 px → docW 1265/winW 1280
  (home, notices, merit lists, gallery).
- Re-seeded with `--samples`: counts identical to the pre-purge baseline.

**Quality gates:**
- `npm run lint`: 0 errors, 1 pre-existing warning (`postcss.config.mjs`)
- `npx tsc --noEmit`: 0 errors
- `npm run build`: compiled successfully, 69/69 static pages

**Banned-pattern check output:** checks 1–4 and 6–8 empty. Check 5 returns only the documented
exception, `components/forms/EnquiryForm.tsx:188` (`motion-safe:animate-spin` in the button
spinner). Unchanged from the Phase A baseline; no frontend file was touched in this phase.

**Screenshots:** `docs/screenshots/phase-C/` — `empty-{home,notices,merit,gallery}-{360,1280}.png`,
the site as it looks with every sample removed. These are a record of the empty-state behaviour,
not of the launch state.

**Deviations from plan:** none. Phase C steps 2 and 3 cannot be completed by an agent — they
need the college to supply content. The tooling gap in step 4 was closed so that step 2 can be
carried out safely when the content does arrive.

**Open questions:** see 5, 6, 7 below, plus two new ones (9, 10).

---

## Phase I (parts 1–2) — Handover documentation + blocker register — 2026-10-12 — Claude
**Status:** done for the parts that do not need other people. Parts 3 (training) and 4
(sign-off) need the owner.

**Summary:** Rewrote the office-staff CMS guide, which was inaccurate — it named menus, boxes
and document types that do not exist in the admin. Every label in the new version was read out
of the plugin source rather than assumed. Added `docs/OPERATIONS-RUNBOOK.md`, which did not
exist (Phase I step 2: where things live, backup and restore, adding users, troubleshooting).
Added `BLOCKERS.md` at the repository root as a single checkbox register of everything waiting
on the college or the owner. Also verified the §7.3 legacy redirects locally, which is Phase H
step 3 brought forward.

**Files changed:**
- `docs/CMS-HANDOVER-GUIDE.md` — rewritten (v1.0 → v2.0)
- `docs/OPERATIONS-RUNBOOK.md` — new
- `BLOCKERS.md` — new
- `docs/PROGRESS.md` — this entry

**What was wrong in the old staff guide.** Every row was checked against
`includes/post-types.php`, `taxonomies.php`, `meta.php`, `settings.php` and
`admin/settings-page.php`:

| Guide v1.0 said | Actually |
|---|---|
| menu "Documents" | **Documents & PDFs** |
| menu "Gallery" → "Add New Album" | **Photo Albums** → Add New |
| menu "Reviews" → "Add New Review" | **Testimonials** → Add New |
| "Add New List" / "Add New Notice" / "Add New Post" | "Add New", except News & Events which is "Add News Item" |
| field "Document File" (all three types) | **List PDF** / **Notice PDF** / **File** |
| sidebar "Academic Year" | **Sessions** |
| sidebar "Programme" | **Programme Tags** |
| document type "Application Form" | **Form** |
| document type "Annual Report / AQAR" | two separate types, **Annual Report** and **AQAR** |
| "Gallery Photos" panel | **Album photos** |
| SNC Settings has "organized tabs" | one page of cards; the sections are College identity, Contact details, Social media, Admissions, Homepage, Reviews, Search & sharing |
| "Admission Open" / "Current Session Label" / "Online Application Link" | **Admissions are open** / **Current admission session** / **Apply Now link** |
| "Google Rating" / "Review Count" | **Google rating** / **Number of Google reviews** |

The guide also had no section at all for Homepage Slides, Faculty & Staff or Committees — the
three things Phases C and D will need staff to fill in. Those are now covered, as is the fact
that **SNC Settings needs an Administrator account** (`manage_options`); an Editor can do
everything else but will not see that menu.

**Two findings recorded, not acted on:**

1. **The committees page shows one session at a time, and nothing is tagged.** `snc_resolve_year()`
   falls back to no filter when no committee carries an `academic_year` term, so all 11 real
   committees list correctly today. The moment a single committee is tagged `2026-27`, the
   resolver selects that year and the other ten disappear from the website. This is a trap for
   the office rather than a bug in the code, so it is documented in the staff guide §10 and in
   `BLOCKERS.md` instead of being changed. **Owner: should untagged committees always show,
   or is one-session-at-a-time the intent?** See Open questions 11.
2. **Redirects return 308, not the 301 that design system §7.3 and `antigravity.md` Phase H
   specify.** This is Next's output for `permanent: true`. Both are permanent and search
   engines treat them identically; 308 also preserves the request method. Recorded so that
   whoever verifies Phase H on production does not log it as a failure. No change made.

**Phase H step 3 brought forward — legacy redirects verified locally (2026-10-12):**
- All 31 explicit entries in `next.config.ts` return a permanent redirect to exactly the
  destination in §7.3, **and so does each one's trailing-slash form**. 0 failures.
- Every distinct destination returns 200. 0 failures.
- `/about/` and `/iqac/` resolve by Next's trailing-slash normalisation (308 → `/about`,
  `/iqac`, both then 200), which is why §7.3 lists 34 sources and the file lists 31. The
  count is correct, not short.
- `/wp-content/uploads/:path*` redirects to the WordPress media host, so old PDF links
  survive.
- This still has to be re-checked on production after DNS; it is listed in `BLOCKERS.md`.

**Acceptance checklist (Phase I):**
- [x] 1. A short guide for office staff covering the jobs they actually do — rewritten and
      verified against the source, with all 12 real wp-admin screenshots captured via headless
      admin session and embedded directly into `docs/CMS-HANDOVER-GUIDE.md`.
- [x] 2. Written down: where things live, who to call, how to restore a backup, how to add a
      user — `docs/OPERATIONS-RUNBOOK.md`. The "who to call" table is deliberately left as
      **[TO BE FILLED]**; inventing a contact would send someone to the wrong number during an
      outage.
- [ ] 3. Train the named person — **blocked:** no person named, no session arranged.
- [ ] 4. Owner's sign-off recorded — **blocked.**

**Quality gates:**
- `npm run lint`: 0 errors, 1 pre-existing warning (`postcss.config.mjs`)
- `npx tsc --noEmit`: 0 errors
- `npm run build`: compiled successfully, 69/69 static pages

**Banned-pattern check output:** checks 1–4 and 6–8 empty; check 5 returns only the documented
`EnquiryForm.tsx:188` exception. No frontend file was changed in this phase.

**Screenshots:** 12 wp-admin screenshots under `docs/screenshots/staff-guide/` (`01-dashboard.png`
through `12-enquiries.png`), captured from the live local WordPress instance with admin auth
and embedded in `docs/CMS-HANDOVER-GUIDE.md`.

**Deviations from plan:** Phase I was taken out of order, because Phases C, D, E, G and H are
all blocked on the college, on photographs or on production hosting, and Phase I parts 1–2 were
the only remaining work that did not need anyone else. Phase H step 3 was verified early for
the same reason.

**Open questions:** 11 (committee sessions, above). The rest are unchanged.

---

## Phase H (local pre-verification) — 2026-10-12 — Claude
**Status:** every Phase H item that can be checked without production hosting now passes. The
rest is blocked on hosting and DNS decisions.

**Summary:** Went looking for remaining implementable work and found none — so this entry
records the search itself, which is the useful result. Routes, redirects, CMS hardening,
revalidation authentication, sitemap and robots were all checked locally. Everything passes;
no code was changed. Two gaps that looked like defects turned out not to be, and are recorded
below so the next agent does not re-investigate them.

**Files changed:** `docs/PROGRESS.md`, `BLOCKERS.md` (local pre-verification noted against the
production items).

**Checked and passing (local, 2026-10-12):**

| Check | Result |
|---|---|
| Every route from `/paths` + the list and detail routes | **65/65 return 200** |
| 31 explicit legacy redirects + trailing-slash forms | 0 failures, every destination 200 |
| `/about/`, `/iqac/` via trailing-slash normalisation | 308 → 200 |
| `/wp-content/uploads/:path*` → CMS media host | 308, correct target |
| CMS serves `X-Robots-Tag: noindex` | present |
| WordPress front end redirects to the site | 302 → `http://localhost:3000/` |
| `/wp/v2/users` | 404 (hidden) |
| Custom post types in `/wp/v2` | 404 (not exposed) |
| `POST /api/revalidate` with no secret | **401** |
| `POST /api/revalidate` with a wrong secret | **401** |
| `GET /api/revalidate` | **405** |
| `robots.txt` | disallows `/styleguide` and `/api/`, points at the sitemap |
| `sitemap.xml` | 61 URLs, no `/styleguide`, no CMS origin leaked |

The 19 "sample" strings in the sitemap are the `[SAMPLE]` news and album slugs. They are a
local artefact and disappear in production, which is seeded without `--samples`.

**Two things that look wrong and are not — do not re-investigate:**

1. **`lib/wp/html.tsx:147` renders a raw `<img>` with an eslint-disable.** This is the
   documented fallback (Plan Phase 4 task 4) for WordPress images that carry no width and
   height. Images that do carry dimensions already go through `next/image` with explicit
   `sizes`. Worth knowing: **Part C check 6 greps `app components` for `<img>` but not `lib`**,
   so this line is invisible to the banned-pattern checks either way.
2. **The fonts are already self-hosted and already minimal.** Phase F suggests "self-host a
   subset" as the lever for the LCP miss, but `next/font` self-hosts by default, Merriweather
   is already cut to weight 700 only, and both faces use `display: 'swap'` — which is exactly
   what produces the repaint Phase F describes. The remaining levers all change how the site
   looks (`display: 'optional'`, or the sans for hero text), so nothing was changed: Phase F
   says to measure on production first, and that instruction still stands.

**Looked for and did not find:** a CMS field the college needs that does not exist. The two
candidates both turned out to be covered — the Principal's qualifications belong in the
existing free-text **Designation** field (design system §5 specifies a qualification field for
faculty PersonCards only, not for leadership messages), and the NAAC grade and year belong in
the body of the `/iqac/naac` WordPress page, which §7.1 defines as "WP Page + documents".
Adding fields for either would have been invented scope.

**Acceptance checklist (Phase H):**
- [ ] 1. Environment variables set on both hosts — **blocked:** no hosting yet. Names and the
      matching-secrets requirement are documented in `docs/OPERATIONS-RUNBOOK.md` §2.
- [ ] 2. Hosting — **blocked on the owner.** The CMS `noindex` header that this step requires
      is confirmed working locally.
- [~] 3. Redirects, uploads path, end-to-end revalidation — **all three verified locally**;
      must be re-confirmed on production after DNS.
- [~] 4. Security — `autologin.php`, `auto-login-link.txt`, `setup_wp.php` absent from the
      repository; revalidation endpoint rejects unauthenticated calls. **Backups are not yet
      configured and no restore has been tested** — that needs the production host.
- [ ] 5. Sitemap submitted to Search Console — **blocked** until the site is live.

**Quality gates:** unchanged and re-run — lint 0 errors (1 pre-existing warning),
`tsc --noEmit` 0 errors, `npm run build` 69/69 pages.

**Banned-pattern check output:** checks 1–4 and 6–8 empty; check 5 returns only the documented
`EnquiryForm.tsx:188` exception.

**Screenshots:** none; no visual change.

**Deviations from plan:** Phase H was entered early and only for the parts that do not need
production, because every other phase is blocked. No production step was attempted or claimed.

**Open questions:** none new.

---

## Open questions
1. ~~Owner: should the agent initialise git and make commits per phase?~~ **Answered 2026-10-12: yes.** The owner created `https://github.com/nayansuthar-1/snccollege.git` and asked for the work to be committed and pushed on their behalf. Done — see Decisions.
2. ~~Owner: should the header's gold button be **Contact Us** (exactly as the college's menu has it) or stay **Apply Now**?~~ **Answered 2026-10-10: Keep Apply Now (gold) with Contact Us as the 8th item.** See Decisions.
3. ~~Owner: `/academics` is now linked from nowhere — the college's menu has no "Academics" item and "Courses" points at `/academics/programmes`. Leave it unlinked, delete the page, or point Courses at it?~~ **Answered 2026-10-10: Leave unlinked; Courses continues to point to `/academics/programmes`.** See Decisions.
4. ~~Owner: `/news` breadcrumbs as Home › Gallery › News & Events, because News sits in the Gallery menu. Acceptable, or should News move?~~ **Answered 2026-10-10: Acceptable; keep under Gallery menu.** See Decisions.
5. **Owner / college: the real Google reviews and rating** — score, review count, listing link, and for each featured review the reviewer's name, text, stars, date and permalink. Nothing is published until these arrive; the homepage shows `[SAMPLE]` reviews only. See "Phase 10 follow-up — Official logo + What People Say About Us".
6. Owner: paste Google reviews into WordPress by hand (as built), or pull them from the **Google Places API**? The API needs a billed Google Cloud key and returns at most five reviews.
7. Owner: is a transparent **SVG** of the new emblem available? The 638 px PNG is slightly soft at the 288 px hero size.
8. ~~Owner: the new emblem's motto is "तमसो मा ज्योतिर्गमय", but design system §8.3 records "Vidya Vinayen Shobhate" from the older seal. Which is current?~~ **Answered 2026-10-10 — see Decisions.**
9. **Owner / college: are the Instagram and YouTube accounts the college's own?** Settings currently
   carry `instagram.com/pragatigroups` and `youtube.com/@pragatiandsnccollege`, both migrated from
   the old site and both apparently the parent trust's rather than the college's. Design system §8.3
   still marks this row "Verify Instagram/YouTube handles with college". Facebook (`/SNCsimalwara`)
   is verified.
10. **Owner: the NAAC grade and the year of accreditation.** Accreditation itself was confirmed on
   2026-10-10, but no grade or year has been supplied, so nothing about NAAC appears on the site.
   Note that `.agents/rules/10-never-invent-content.md` still states the college is *not* accredited,
   which now contradicts §8.3 — the rule should be corrected once the details arrive, by the owner's
   instruction rather than by an agent.
11. **Owner: should committees with no session always be listed?** The committees page shows one
   session at a time. `snc_resolve_year()` falls back to no filter while nothing carries an
   `academic_year` term, so all 11 real committees show today — but tagging a single committee
   with a session hides the other ten. Either all committees get tagged together (the office has
   been warned in the staff guide), or the resolver should keep untagged committees visible.
   No code was changed pending this answer.

## Decisions
- 2026-10-12: **The project is under version control** at `https://github.com/nayansuthar-1/snccollege.git`, pushed to `main` on the owner's instruction. The repository holds the project's own source — `frontend/`, `wp-content/plugins/snc-core-headless/`, `docs/`, `.agents/` and the root markdown — and **not** WordPress core, `wp-config.php`, `frontend/.env.local` or `wp-content/uploads/`. It is therefore **not a backup**: restoring the site needs this code plus a database dump plus the uploads folder, as `README.md` and `docs/OPERATIONS-RUNBOOK.md` §4 both say. Core can be added later if the owner wants a full-install repository; removing a committed secret could not be undone as easily, which is why the split was made this way.
- 2026-10-09: Content items will be supplied later by the owner; see `docs/03-CONTENT-REQUIREMENTS.md`.
- 2026-10-10: Primary navigation follows the college's own menu, not design system §7.2. Routes are unchanged; see "Phase 10 follow-up" for the full list of deviations.
- 2026-10-10: The official emblem (`SNC_Logo.png` from the old site) is bundled as the default logo and overridable from SNC Settings → College identity → College logo.
- 2026-10-10: Homepage reviews section is driven entirely by WordPress. No review text, score or review count is ever written into the code.
- 2026-10-10: **The college motto is "तमसो मा ज्योतिर्गमय" ("Lead me from darkness to light")**, confirmed by the owner. The older seal's "Vidya Vinayen Shobhate" is superseded and must not be used. Design system §8.3 corrected (the only edit made to that document; its §6.1 wireframe still shows the old motto as an illustrative heading placeholder, which is not a factual claim). Devanagari is set upright, never italic.
- 2026-10-10: Remaining work moves to **Antigravity**, planned as phases **A–I** in `antigravity.md` at the repository root (lettered so they never collide with the finished Phases 0–10). Antigravity rules live in `.agents/rules/` and skills in `.agents/skills/`; `AGENTS.md` points at both and is read by every agent in the workspace.
- 2026-10-10: **Header button remains "Apply Now" (gold accent)** and "Contact Us" remains the eighth top-level navigation item.
- 2026-10-10: **`/academics` remains unlinked in the primary navigation** while "Courses" points directly to `/academics/programmes`.
- 2026-10-10: **`/news` remains located under the "Gallery" menu** with breadcrumb "Home › Gallery › News & Events".
- 2026-10-10: **Founder name spelling confirmed as "Prashant Choubisa"** (single 's').
- 2026-10-10: **AISHE code omitted entirely** from the website (no unverified code shown).
- 2026-10-10: **Programmes offered confirmed as B.A. and B.Sc. only.** All conflicting mentions of M.A., B.Com, BCA, M.Sc. on legacy pages confirmed inactive.
- 2026-10-10: **NAAC accreditation confirmed as accredited by owner**; pending official grade and year details to be supplied before publishing to the site.

