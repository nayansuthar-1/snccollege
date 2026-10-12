# SNC College Website — Implementation Plan

**Read first:** `docs/01-DESIGN-SYSTEM.md`. This plan says *what to build and in what order*; the design system says *how it must look and behave*. Both are binding.
**Version:** 1.0 · 2026-10-09

---

## Part A — Rules for the implementing agent (strict)

These rules apply to every phase. Violating them means the phase is **not done**, regardless of how the result looks.

### A1. Process
1. Work **one phase at a time, in order**. Do not start phase N+1 until every acceptance checkbox of phase N is ticked and recorded in `docs/PROGRESS.md`.
2. At the start of a phase, re-read the phase section here and the design-system sections it references.
3. At the end of a phase, append to `docs/PROGRESS.md` using the template in Part D: what was done, files changed, deviations (with reasons), screenshots taken, open questions.
4. If the plan is ambiguous or seems wrong, **stop and write the question in `docs/PROGRESS.md` under "Open questions"**, then continue with the parts that are unambiguous. Do not invent a new direction.
5. Do not refactor, rename, or "improve" things outside the current phase's scope.
6. Do not delete or rewrite these two docs. You may append clarifications to the design system only when a phase explicitly asks for it.

### A2. Code rules
1. **Next.js 16 is not the Next.js in your training data.** Before writing routing, data fetching, caching, metadata, fonts, images, route handlers or server actions, read the matching file in `frontend/node_modules/next/dist/docs/01-app/`. Known differences you must respect:
   - `params` and `searchParams` are **Promises**: `const { slug } = await params`.
   - `revalidateTag(tag, 'max')` takes **two arguments**; the one-argument form is deprecated.
   - Middleware is now called **Proxy** (`proxy.ts`). We do not need one.
2. TypeScript strict. No `any` (use `unknown` + narrowing). No `@ts-ignore`.
3. Server Components by default. `'use client'` only for: MegaMenu/MobileNav/header interactivity, HeroSlider, Tabs, DocumentFilters, Lightbox, EnquiryForm, MobileActionBar (if it needs state). Never mark a page or layout as client.
4. Styling only with Tailwind utilities generated from the tokens in `globals.css`. See banned patterns in design system §9.
5. **No fabricated data.** No fallback objects with fake notices/programmes/fees/stats. On fetch failure: list sections render `EmptyState` (inner pages) or are omitted (homepage); missing pages call `notFound()`.
6. Every component file exports one component; filename = component name in PascalCase.
7. Allowed npm dependencies (already installed or to be added in Phase 0): `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `lucide-react`, `clsx`, `tailwind-merge`, `embla-carousel-react`, `embla-carousel-autoplay`, `yet-another-react-lightbox`, `html-react-parser`. **Any other dependency requires the project owner's approval** — write the request in `docs/PROGRESS.md`.
8. Run before declaring any phase done (all must pass with zero errors and zero warnings you introduced):
   ```bash
   cd frontend
   npm run lint
   npx tsc --noEmit
   npm run build
   ```
9. Run the **banned-pattern checks** (Part C) and paste the (empty) output into `docs/PROGRESS.md`.

### A3. Visual verification
For every page/component built in a phase, check it in the browser at **360 px, 768 px, 1280 px and 1440 px** widths and confirm:
- All left edges align to the container (logo, headings, cards, footer columns).
- Section padding is visibly present (≥64 px top/bottom on mobile, ≥96 px on desktop).
- No horizontal scroll at 360 px.
- Keyboard: Tab through the whole page; focus is always visible; menus/tabs/slider work with keyboard.
Save screenshots to `docs/screenshots/phase-N/{page}-{width}.png` (directory is git-ignored if large; at minimum keep 1280 and 360).

### A4. Do not touch
- WordPress core files (`wp-admin/`, `wp-includes/`, root `wp-*.php`).
- `frontend/AGENTS.md` auto-generated block (between the `BEGIN/END:nextjs-agent-rules` markers).

---

## Part B — Target architecture

### B1. Overview
```
Browser ──► Next.js 16 (frontend/, Server Components, ISR + tag revalidation)
                 │  server-side fetch only (no browser→WP calls)
                 ▼
          WordPress (headless CMS, plugin: snc-core-headless)
             REST namespace: /wp-json/snc/v1/*
             on save → POST {FRONTEND}/api/revalidate  (secret header, tags)
```
- WordPress is only an admin + API. Its public theme front-end is not used (plugin redirects non-admin, non-REST, non-media requests to the Next.js site).
- Suggested hosting (owner to confirm): Next.js on `snccollegedpr.in`; WordPress on `cms.snccollegedpr.in` with `noindex`.

### B2. Environment variables
`frontend/.env.local` (never committed; add `frontend/.env.example` with empty values):
```
WORDPRESS_URL=http://localhost:8881          # server-only; NOT NEXT_PUBLIC
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=change-me-long-random
```
`wp-config.php` (add, values per environment):
```php
define('SNC_FRONTEND_URL', 'http://localhost:3000');
define('SNC_REVALIDATE_SECRET', 'change-me-long-random');
```

### B3. Frontend folder structure (target)
```
frontend/
  app/
    layout.tsx                 # fonts, TopBar, SiteHeader, <main id="main">, SiteFooter, MobileActionBar
    page.tsx                   # Home
    not-found.tsx  error.tsx  loading.tsx (only where useful)
    sitemap.ts  robots.ts
    [...path]/page.tsx         # generic WP page → Landing or Section template
    about/messages/page.tsx
    academics/programmes/page.tsx
    academics/programmes/[slug]/page.tsx
    academics/faculty/page.tsx
    admissions/merit-lists/page.tsx
    students/notices/page.tsx
    students/syllabus/page.tsx
    students/question-papers/page.tsx
    students/downloads/page.tsx
    iqac/committees/page.tsx
    iqac/reports/page.tsx
    campus-life/gallery/page.tsx
    campus-life/gallery/[slug]/page.tsx
    news/page.tsx
    news/[slug]/page.tsx
    contact/page.tsx
    styleguide/page.tsx        # dev-only component gallery (404 in production)
    api/revalidate/route.ts
  components/
    ui/        Container Section SectionHeader Button Badge Tabs Accordion EmptyState
               ImagePlaceholder Pagination Breadcrumbs IconTile
    cards/     FeatureCard ProgrammeCard NewsCard PersonCard MessageCard TestimonialCard InfoCard
    layout/    SkipLink TopBar SiteHeader DesktopNav MegaMenu MobileNav SiteFooter
               MobileActionBar WhatsAppButton
    page/      PageHero SectionNav SectionPageLayout LandingPageLayout Prose
    home/      HeroSlider QuickLinks AboutIntro NoticeBoard ProgrammesSection WhyChoose
               CtaBand LeadershipSection NewsSection LifeAtSnc TestimonialsSection AffiliationStrip
    documents/ DocumentList DocumentFilters DocumentRow
    forms/     EnquiryForm  (+ app-level server action in forms/actions.ts)
    gallery/   AlbumGrid PhotoGrid GalleryLightbox
    icons/     social.tsx  (Facebook, Instagram, YouTube, WhatsApp SVG marks)
  config/
    navigation.ts              # single source of nav (header, mobile, footer, sidebars, breadcrumbs)
    site.ts                    # non-factual constants: revalidate seconds, page sizes, image sizes
  lib/
    wp/client.ts               # wpFetch()
    wp/types.ts                # API contract types (Part B5)
    wp/api.ts                  # one function per endpoint
    wp/html.tsx                # WP HTML → React (link rewrite, next/image, block mapping)
    cn.ts  format.ts           # cn(); formatDate (en-IN), formatFileSize
  public/images/               # emblem (official file), og-default.jpg — nothing else
```

### B4. WordPress content model (target)

Native WordPress post types + meta registered with `show_in_rest`. **No ACF.** Admin edit screens use meta boxes in the existing plugin style. Attachments are always stored as **attachment IDs** (never pasted URLs) so size/mime/alt can be resolved.

| Type | Slug | Fields (meta key → type) | Taxonomies |
|------|------|--------------------------|-----------|
| Page (core) | `page` | title, content (blocks), featured image (= page hero bg), excerpt (= meta description); `snc_hero_subtitle` string | — (hierarchy = URL path) |
| Post (core) | `post` | news/events/press notes; featured image | `category`: news, events, press-notes |
| Hero slide | `hero_slide` | `snc_image_desktop` int, `snc_image_mobile` int, `snc_eyebrow`, `snc_heading`, `snc_subtext`, `snc_cta1_label`, `snc_cta1_url`, `snc_cta2_label`, `snc_cta2_url`, `snc_link_url`; order = `menu_order` | — |
| Notice | `circulars` (label "Notices") | content optional; `snc_document_id` int, `snc_external_url`, `snc_is_important` bool | `circular_type` (label "Notice type"): admission, examination, scholarship, academic, events, general |
| Programme | `programs` | title, content (overview), excerpt, featured image; `snc_short_name` ("B.A."), `snc_duration`, `snc_pattern`, `snc_eligibility`, `snc_subjects` (one per line), `snc_career_paths` (one per line), `snc_syllabus_document_id` int, `snc_intake` (optional), `snc_fee_note` (optional, shown only if filled) | `program_level` (UG, PG, Diploma), `programme` (ba, bsc, …) |
| Merit / admission list | `merit_lists` | `snc_document_id` int | `academic_year`, `programme`, `list_type` (merit, waiting, provisional-admitted, final-admitted, other), `merit_category` (general, obc, sc, st, ews, mbc, divyang, all) |
| Document | `documents` (new) | `snc_document_id` int, `snc_external_url` | `document_type` (syllabus, question-paper, form, calendar, naac, aqar, aishe, annual-report, disclosure, compliance, fee, committee-order, other), `academic_year`, `programme` |
| Faculty / staff | `faculty_staff` | title = name, featured = photo; `snc_designation`, `snc_qualification`, `snc_experience`, `snc_public_contact` bool, `snc_email`; order = `menu_order` | `program_department` (arts, science, administration), `staff_type` (teaching, non-teaching) |
| Committee | `committees` | content = purpose; `snc_convener`, `snc_members_json` (array of {name, designation, role}), `snc_order_document_id` int; order = `menu_order` | `academic_year` |
| Leader message | `leader` (new) | title = name, featured = photo, excerpt = short quote (≤60 words), content = full message; `snc_designation`; order = `menu_order` | — |
| Gallery album | `gallery` (replaces `campus_life`) | title, date, content (description), featured = cover; `snc_photo_ids` (int[]) | — |
| Testimonial | `testimonials` | content = quote, title = name, featured = photo; `snc_programme_batch`, `snc_consent` bool (only consented ones are returned) | — |
| Enquiry (private) | `enquiry` (new, not public, not in REST read) | `snc_phone`, `snc_email`, `snc_programme`, `snc_message`, `snc_ip_hash` | — |
| **Site settings** | options page "SNC Settings" | identity: `college_name`, `hindi_name`, `short_about`, `affiliation`; contact: `phone_admission`, `phone_office`, `email`, `address`, `map_embed_url`, `map_link`, `office_hours`, `whatsapp`; social: `facebook`, `instagram`, `youtube`; admission: `session_label`, `admission_open` bool, `apply_url`; home: `about_eyebrow`, `about_heading`, `about_body`, `about_image_id`, `why_items` (exactly 6 × {icon, title, text}; icon from a fixed list), `facts` (up to 4 × {value, label}), `cta_heading`, `cta_text`, `cta_image_id`; seo: `default_og_image_id` | — |

Shared taxonomies: `academic_year` (2026-27, 2025-26, …) and `programme` (ba, bsc, …) are registered once and attached to every type that uses them.

### B5. REST API contract (`/wp-json/snc/v1/…`)

**Call them as `{WORDPRESS_URL}/?rest_route=/snc/v1/…`** (not `/wp-json/…`): this works with every permalink setting, including the plain permalinks of the local install.
`GET /documents?type=` accepts a comma-separated list (e.g. `type=aqar,aishe,annual-report`).
All endpoints are public GET (except enquiry POST), return normalised JSON (no `_embed`, no `rendered` wrappers), and send `Cache-Control: public, max-age=60`. Types below are the TypeScript contract in `frontend/lib/wp/types.ts`; the PHP must produce exactly these shapes.

```ts
type Img   = { url: string; width: number; height: number; alt: string };
type File  = { url: string; mime: string; size_bytes: number; filename: string };
type Term  = { slug: string; name: string };

GET /settings                      → Settings
GET /home                          → { slides: Slide[]; notices: Notice[6]; programmes: ProgrammeSummary[];
                                       leaders: Leader[]; news: NewsSummary[3]; gallery: Img[5];
                                       testimonials: Testimonial[] }
GET /page?path=about/vision-mission → { id; title; path; subtitle?; content_html; excerpt; hero_image?: Img;
                                       updated_at } | 404
GET /notices?type=&page=&per_page= → Paged<Notice>        Notice = { id; title; slug; date; type: Term;
                                                            important: boolean; file?: File; url?: string }
GET /merit-lists?year=&programme=&list_type=&category=
                                   → { items: MeritList[]; selected_year: string; years: Term[]; programmes: Term[];
                                       list_types: Term[]; categories: Term[] }
                                     (no year param → latest session that has lists; selected_year says which)
GET /documents?type=&year=&programme= → { items: Doc[]; years: Term[] }
GET /programmes                    → ProgrammeSummary[]
GET /programmes/{slug}             → Programme | 404
GET /faculty?department=           → Person[]
GET /committees?year=              → { items: Committee[]; selected_year: string; years: Term[] }
                                     (no year param → latest session with committees; '' = none tagged, all returned)
GET /leaders                       → Leader[]
GET /gallery?page=                 → Paged<AlbumSummary>
GET /gallery/{slug}                → Album | 404
GET /news?category=&page=          → Paged<NewsSummary> & { categories: Term[] }   (categories in use, for the tabs; "uncategorized" excluded)
GET /news/{slug}                   → NewsItem | 404
GET /paths                         → { pages: string[]; programmes: string[]; news: string[]; gallery: string[] }  (for sitemap/static params)
POST /enquiry  {name, phone, email?, programme?, message?, website (honeypot)}
                                   → 201 {ok:true} | 400 {ok:false, errors} | 429 {ok:false}
type Paged<T> = { items: T[]; page: number; total_pages: number; total: number };
```
Dates are ISO 8601 strings (`2026-10-09`), formatted on the frontend with `en-IN` locale ("9 Oct 2026").

### B6. Cache tags
`settings`, `home`, `page:{path}`, `pages`, `paths`, `notices`, `merit-lists`, `documents`, `programmes`, `faculty`, `committees`, `leaders`, `gallery`, `news`, `testimonials`, `slides`.
Every page fetch must carry both `page:{path}` and `pages`: when a bulk edit produces more than 20 tags, the plugin drops the `page:*` tags and sends `pages` instead. The enquiry POST sends `x-snc-secret` + `x-snc-client-ip` so WordPress rate-limits per visitor, not per Next.js server.
The plugin maps each post type to its tags (+ `home` when the type appears on the homepage) and posts `{ "tags": [...] }` to `/api/revalidate` on `save_post`, `deleted_post`, `trashed_post`, `edited_term`, and settings update.

---

## Part C — Banned-pattern checks (run at the end of every phase)

Run from `frontend/`. Each command must print **nothing** (except the explicitly allowed lines noted).

```bash
# 1. Default Tailwind palette colours (use tokens instead)
grep -rnE "\b(bg|text|border|from|via|to|ring|fill|stroke|divide|outline)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}" app components

# 2. Hex colours in components (WhatsApp green is the `whatsapp` token, so no exceptions)
grep -rnE "#[0-9a-fA-F]{3,8}\b" app components --include=*.ts --include=*.tsx

# 3. Inline style colours/spacing/typography (backgroundImage for dynamic URLs is allowed)
grep -rnE "style=\{\{[^}]*\b(color|backgroundColor|background:|margin|padding|font)" app components

# 4. Banned radii / shadows / blur
grep -rnE "rounded-(2xl|3xl)|rounded-\[|shadow-(lg|2xl)|blur-\[|drop-shadow" app components

# 5. Infinite / decorative animations
grep -rnE "animate-(marquee|pulse|ping|bounce|spin)|@keyframes" app components app/globals.css

# 6. Stock images and raw <img>
grep -rniE "unsplash|pexels|pixabay" app components lib
grep -rnE "<img\b" app components

# 7. Fake data / fallbacks
grep -rniE "default(Settings|Homepage|MeritLists)|lorem|C-39947|94144 73665|100% placement|NAAC Accredited" app components lib config

# 8. Unlayered CSS (globals.css must contain only @import, @theme, @layer blocks)
grep -nE "^[^@ /}\t].*\{" app/globals.css
```
`shadow-xl` is allowed only in `MegaMenu.tsx`. `animate-spin` is allowed only in a button loading spinner inside `EnquiryForm.tsx` (wrap in `motion-safe:`) — if used, note it in PROGRESS.md.

---

## Part D — `docs/PROGRESS.md` entry template

```md
## Phase N — <name> — <date> — <agent/person>
**Status:** done | blocked
**Summary:** 2–4 sentences.
**Files changed:** list
**Acceptance checklist:** (copy the phase checklist, ticked)
**Banned-pattern check output:** (paste; must be empty)
**Screenshots:** docs/screenshots/phase-N/…
**Deviations from plan:** none | list with reasons
**Open questions:** none | list
```

---

## Part E — Phases

---

### Phase 0 — Clean slate & foundation

**Goal:** Remove the broken build, fix the root CSS bug, install the design tokens and fonts. After this phase the site renders a blank, correctly-styled shell.

**Tasks**
1. **Repository hygiene (project root `d:\singularitylabs\SNC`)**
   - Delete `autologin.php` and `auto-login-link.txt` (**security hole: passwordless admin login; must never reach a server**).
   - Delete `setup_wp.php`, `scratch/`, `temp_wp/`, and the stray `wordpress/` folder (WordPress core already lives at the root). Confirm the local WP still loads at `http://localhost:8881/wp-admin` afterwards.
   - Initialise git at the project root if not present, with a `.gitignore` covering `wp-config.php`, `wp-content/uploads/`, `frontend/node_modules`, `frontend/.next`, `.env*` (except `.env.example`), `docs/screenshots/`. Commit the current state **before** deleting anything ("chore: snapshot before rebuild"), then commit Phase 0 separately.
2. **Delete old frontend code:** everything in `frontend/components/`, `frontend/context/`, all route folders under `frontend/app/` (`about`, `academics`, `admissions`, `campus-life`, `contact`, `governance`, `iqac`, `student-corner`), `frontend/lib/wp.ts`, `public/images/hero-campus.jpg`, `public/images/chairman.jpg` (unverified images).
3. **Emblem:** keep `public/images/logo.jpg` temporarily, renamed to `public/images/emblem.jpg`; add an Open question asking the college for the official transparent PNG/SVG.
4. **Dependencies:** `npm i clsx tailwind-merge embla-carousel-react embla-carousel-autoplay yet-another-react-lightbox html-react-parser`. Remove `@tailwindcss/turbopack` if unused.
5. **`app/globals.css`** — rewrite completely:
   - `@import "tailwindcss";`
   - `@theme { --color-*: initial; … }` — reset the default palette, then define `white`, `black`, `transparent`, `current`, and every token in design system §3.1 (`--color-primary-950` … `--color-success-700`).
   - `@theme inline { --font-serif: var(--font-merriweather), Georgia, serif; --font-sans: var(--font-jakarta), var(--font-devanagari), system-ui, sans-serif; }`
   - `@layer base` rules from design system §3.6 only.
   - `@layer components { .prose-snc { … } }` per design system §5.17 (can be completed in Phase 1).
6. **`app/layout.tsx`** — load Merriweather (700, 900) and Plus Jakarta Sans (400–700) via `next/font/google` with CSS variables on `<html>` (Devanagari uses system fonts — see design system §3.2); `lang="en"`; `<body class="min-h-dvh bg-white font-sans text-ink-700 antialiased">`; placeholder `<main id="main">`. Default metadata (`metadataBase` from `NEXT_PUBLIC_SITE_URL`, title template `%s | SNC College, Simalwara`).
7. **`next.config.ts`** — `images.remotePatterns` restricted to the WordPress host parsed from `WORDPRESS_URL` (no `**`). Add `images.formats: ['image/avif','image/webp']`.
8. Add `frontend/.env.example` (Part B2) and `lib/cn.ts` (`clsx` + `tailwind-merge`).
9. Create `docs/PROGRESS.md` with a header and the Phase 0 entry.

**Acceptance criteria**
- [ ] `autologin.php`, `auto-login-link.txt`, `setup_wp.php`, `scratch/`, `temp_wp/`, `wordpress/` are gone; WP admin still works.
- [ ] Git initialised; snapshot commit exists before deletions.
- [ ] `frontend/components`, `frontend/context`, old routes and `lib/wp.ts` are gone.
- [ ] `globals.css` contains only `@import`, `@theme`, `@theme inline`, `@layer` blocks; check 8 in Part C is empty.
- [ ] A test element with `class="p-8 mt-12 bg-primary-800 text-white font-serif"` renders with real padding/margin, navy background and Merriweather (verify in DevTools, then remove it).
- [ ] `bg-blue-500` produces **no** style (default palette removed).
- [ ] No `<link>` to fonts.googleapis.com in the rendered HTML.
- [ ] lint, tsc, build pass.

**Do NOT:** build any UI components yet; add any content; keep any old component "for reference".

---

### Phase 1 — Design primitives & styleguide

**Goal:** Every reusable building block from design system §5 exists, is typed, and is visible on `/styleguide`.

**Tasks**
1. Build in `components/ui/`: `Container`, `Section` (props: `tone: 'white' | 'muted' | 'dark'`, `size: 'default' | 'band'`, `id?`), `SectionHeader`, `Button` (variants + sizes + link/external handling), `Badge`, `IconTile`, `Tabs` (client, accessible), `Accordion` (`<details>`), `EmptyState`, `ImagePlaceholder`, `Pagination`, `Breadcrumbs` (+ JSON-LD).
2. Build in `components/cards/`: `FeatureCard`, `ProgrammeCard`, `NewsCard`, `PersonCard` (with initials fallback), `MessageCard`, `TestimonialCard`, `InfoCard`.
3. Build in `components/page/`: `PageHero`, `SectionNav` (desktop sticky card + mobile `<details>`), `SectionPageLayout` (hero + 3/9 grid), `LandingPageLayout`, `Prose` (wrapper applying `.prose-snc`).
4. Build in `components/documents/`: `DocumentRow`, `DocumentList` (table ≥md, stacked <md, badges, file-size formatting, empty state). Filters come in Phase 7.
5. Build `components/icons/social.tsx`.
6. Complete `.prose-snc` styles (design system §5.17), including `wp-block-*` mappings.
7. `lib/format.ts`: `formatDate(iso, 'short' | 'long')` using `Intl.DateTimeFormat('en-IN')`, `formatFileSize(bytes)` ("420 KB", "1.2 MB"), `isNew(iso, days = 7)`.
8. `/styleguide` page rendering every component in every variant with **obviously-labelled sample props** (e.g., title "Sample programme card"), plus colour swatches and the type scale. The route must return `notFound()` when `process.env.NODE_ENV === 'production'`.

**Acceptance criteria**
- [ ] Every class string matches design system §3–§5 (reviewer spot-checks Button, SectionHeader, Card, PageHero, DocumentList against the doc).
- [ ] `/styleguide` shows all components at 360/768/1280 with no overflow; screenshots saved.
- [ ] Tabs: arrow keys move between tabs; `aria-selected` correct. Accordion works without JS.
- [ ] Buttons render `<a>` for links (internal via `next/link`, external with `rel` + sr-only text) and `<button>` otherwise.
- [ ] `DocumentList` with 0 items shows `EmptyState`.
- [ ] Part C checks empty; lint/tsc/build pass.

**Do NOT:** fetch any data; create page routes other than `/styleguide`; add props "for future use".

---

### Phase 2 — Global chrome (header, navigation, footer)

**Goal:** The site frame is final and identical on every page.

**Tasks**
1. `config/navigation.ts`: typed tree (`NavItem = { label; href; description?; children?: NavGroup[]; image?: { src; tagline; title } }`), exactly as design system §7.2 (7 top-level items, groups for Academics), plus `utilityLinks` (6), `footerQuickLinks`, `footerImportantLinks` (external), `sectionRoots` (used by SectionNav & breadcrumbs). Helper functions: `getSectionForPath(path)`, `getBreadcrumbs(path, currentTitle)`.
2. `TopBar`, `SiteHeader`, `DesktopNav`, `MegaMenu`, `MobileNav`, `SiteFooter`, `MobileActionBar`, `WhatsAppButton`, `SkipLink` — exactly per design system §5.4–§5.7, §5.21–§5.22.
3. Header/Footer receive `Settings` as props (phones, email, socials, address, apply URL). Until Phase 4 the layout passes a **typed empty settings object** — empty fields simply hide their UI (e.g., no phone link if phone is empty). Do **not** hardcode phone numbers.
4. Active-state logic: top-level item is active when the current path starts with its `href` (Home only on `/`).
5. Mega menu image panels use `ImagePlaceholder` until real photos exist.
6. Accessibility: skip link, `aria-expanded`/`aria-controls`, Escape handling, focus return, focus trap in mobile drawer, body scroll lock, route-change close.

**Acceptance criteria**
- [ ] At 1280 px: utility bar 40 px, header 80 px, 7 nav items + Apply Now fit on one line without wrapping; logo text not truncated.
- [ ] At 1024–1279 px: hamburger shown, no desktop nav, no overflow.
- [ ] At 360 px: header 64 px, emblem + one-line name, hamburger; mobile action bar visible; footer not hidden behind it.
- [ ] Mega menus open on hover and on keyboard (Enter/Space/ArrowDown), close on Escape/outside click; no menu exceeds 10 links; no third level.
- [ ] Mobile drawer: focus trapped, Escape closes, scroll locked, accordion groups work.
- [ ] Footer: 4 columns ≥lg, 2 columns md, 1 column mobile; gold top border; bottom bar.
- [ ] Only one floating element per breakpoint (WhatsApp on desktop, action bar on mobile).
- [ ] Lighthouse accessibility ≥ 95 on a blank page with chrome.
- [ ] Part C checks empty; lint/tsc/build pass; screenshots saved.

**Do NOT:** add a ticker, AISHE/NAAC badges, admission popup, back-to-top button, language switcher, or search (search may be proposed as an open question).

---

### Phase 3 — WordPress backend: content model & API

**Goal:** WordPress exposes exactly the content model (B4) and API contract (B5). The college can enter all content through wp-admin with clear labels.

**Tasks**
1. Refactor `wp-content/plugins/snc-core-headless/`:
   ```
   snc-core-headless.php            # bootstrap, constants, includes
   includes/post-types.php          # CPTs per B4 (show_in_rest, menu icons, labels, supports)
   includes/taxonomies.php          # shared taxonomies + default terms (inserted on activation)
   includes/meta.php                # register_post_meta (types, sanitize callbacks, auth)
   includes/admin/meta-boxes.php    # edit screens; media pickers via wp.media for attachment IDs/galleries
   includes/admin/settings-page.php # "SNC Settings" options page (sections per B4)
   includes/rest/serializers.php    # img(), file(), term() helpers → B5 shapes
   includes/rest/routes.php         # every endpoint in B5
   includes/rest/enquiry.php        # validation, honeypot, rate limit (5 / 10 min / IP via transients), store as private CPT, wp_mail to admission email
   includes/revalidate.php          # hooks → wp_remote_post to SNC_FRONTEND_URL/api/revalidate (non-blocking, timeout 3 s)
   includes/headless.php            # redirect public theme requests to SNC_FRONTEND_URL; noindex; disable xmlrpc, comments, emojis, oEmbed discovery
   seed/seed-sample.php             # WP-CLI command `wp snc seed` (sample data, every title prefixed "[SAMPLE] ")
   ```
2. Migrations from the current plugin: rename/replace `campus_life` → `gallery`; convert merit-list `snc_list_type` meta → `list_type` taxonomy; add `documents`, `leader`, `hero_slide`, `enquiry` CPTs; add `programme`, `list_type`, `document_type`, `staff_type` taxonomies; drop `snc_total_seats` / `snc_fee_per_year` fields (replaced by optional `snc_intake` / `snc_fee_note`).
3. Delete the old `scratch/seed_initial_data.php` data from the database (fake fees, B.Com, M.A., fake merit lists). Then run the new seed **only on local**.
4. Seed must create real, verified content where available (design system §8.3): programmes B.A. and B.Sc. with real subjects/duration; settings with verified address/phones/email/socials; pages for every route in design system §7.1 with content migrated from the old site (minus lorem ipsum); leaders (Chairman name; Principal "[SAMPLE] Principal" until provided). Everything not verified is `[SAMPLE]`.
5. Page hierarchy in WP mirrors routes (`about` → children `pragati-sansthan`, `vision-mission`, …), so `get_page_by_path()` resolves `about/vision-mission`.
6. Admin UX: CPT menu labels in plain English ("Notices", "Merit Lists", "Documents & PDFs", "Faculty & Staff", "Committees", "Leadership Messages", "Photo Albums", "Homepage Slides", "Testimonials", "Enquiries"); helpful field descriptions (e.g., "Upload the PDF. File size is detected automatically."); admin list columns for year/programme/type with filters.
7. Security: `permission_callback => '__return_true'` only on public GET routes; enquiry validates and sanitises every field; no endpoint exposes enquiries, emails of non-public staff, or draft content. CORS: none needed (server-to-server) — remove the permissive CORS file.

**Acceptance criteria**
- [ ] Every endpoint in B5 returns the documented shape (verify with `curl` and paste one sample response per endpoint into PROGRESS.md).
- [ ] `/page?path=about/vision-mission` works; unknown path → 404 JSON.
- [ ] Merit-list endpoint filters by year/programme/list_type/category and returns the filter term lists.
- [ ] File objects include real `size_bytes` from the attachment.
- [ ] Saving a notice triggers a POST to the frontend revalidate URL with tags `["notices","home"]` (verify in a log).
- [ ] Enquiry: valid submission → 201 and stored as private `enquiry`; honeypot filled → 400; 6th submission in 10 minutes from same IP → 429.
- [ ] Visiting the WP site root redirects to the frontend; wp-admin and `/wp-json` still work.
- [ ] No fake data remains in the DB except items titled `[SAMPLE] …`.
- [ ] All admin screens usable by a non-technical editor (owner review).

**Do NOT:** install ACF, page builders, or headless plugins (WPGraphQL etc.); expose `wp/v2/users`; store files as pasted URLs.

---

### Phase 4 — Frontend data layer

**Goal:** Typed, cached, revalidatable access to every endpoint, and safe rendering of WordPress HTML.

**Tasks**
1. `lib/wp/types.ts` — exact contract from B5.
2. `lib/wp/client.ts` — `wpFetch<T>(path, { tags, revalidate = 300 })` using `fetch(WORDPRESS_URL + '/wp-json/snc/v1' + path, { next: { revalidate, tags } })`; `import 'server-only'`; returns `null` on 404; throws `WpError` on other failures. Read `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`, `08-caching.md`, `09-revalidating.md` first.
3. `lib/wp/api.ts` — one function per endpoint (`getSettings`, `getHome`, `getPage(path)`, `getNotices(params)`, `getMeritLists(params)`, `getDocuments(params)`, `getProgrammes`, `getProgramme(slug)`, `getFaculty`, `getCommittees`, `getLeaders`, `getAlbums`, `getAlbum`, `getNews`, `getNewsItem`, `getPaths`, `submitEnquiry`). List functions catch `WpError`, log it, and return an **empty** result (never sample data). `getSettings` failure returns the typed empty settings object.
4. `lib/wp/html.tsx` — `renderWpHtml(html)` via `html-react-parser`: rewrite absolute links to the WP host into frontend paths (`next/link`); keep `/wp-content/uploads/` links pointing to the media host; replace `<img>` with `next/image` when width/height are known (fallback: plain `img` with `loading="lazy"` and `decoding="async"` — this is the only allowed raw `img`, add an eslint-disable comment with the reason); strip `<script>`, `<style>`, inline `style` attributes, and `on*` attributes; wrap tables in a scroll container; map `wp-block-file` to `DocumentRow` look.
5. `app/api/revalidate/route.ts` — POST only; checks `x-snc-secret` header equals `REVALIDATE_SECRET` (constant-time compare); body `{ tags: string[] }` (max 20, each ≤ 100 chars); calls `revalidateTag(tag, 'max')` for each; returns `{ revalidated: tags }`. 401 on bad secret.
6. Wire `getSettings()` into `app/layout.tsx` → TopBar, SiteHeader, SiteFooter, MobileActionBar.

**Acceptance criteria**
- [ ] Header/footer show real phones/email/address/socials from WP settings.
- [ ] Stopping WordPress: site still renders chrome (with empty contact fields hidden) and pages show EmptyState / 404 — no crash, no fake data.
- [ ] Editing settings in wp-admin updates the live site within seconds (revalidate hook works) without redeploy.
- [ ] `renderWpHtml` strips scripts/inline styles (unit-check with a sample string in PROGRESS.md).
- [ ] Revalidate route rejects wrong secret (401) and accepts right one.
- [ ] Part C checks empty; lint/tsc/build pass.

**Do NOT:** call WordPress from client components; expose `WORDPRESS_URL` to the browser; add a fallback data file.

---

### Phase 5 — Homepage

**Goal:** Homepage exactly per design system §6.1.

**Tasks**
1. `app/page.tsx` fetches `getHome()` + `getSettings()` in parallel and renders, in order: `HeroSlider` → `QuickLinks` → `AboutIntro` + `NoticeBoard` → `ProgrammesSection` → `WhyChoose` → `CtaBand` → `LeadershipSection` → `NewsSection` → `LifeAtSnc` → `TestimonialsSection` (only if ≥3) → `AffiliationStrip`.
2. Section backgrounds alternate by **index of rendered sections** (white / ink-50), with QuickLinks and CtaBand being fixed dark bands that reset the alternation. Omit sections with no data.
3. HeroSlider: Embla + Autoplay (6 s, stop on interaction, off for reduced motion), desktop/mobile images, text overlay variant and banner variant, accessible controls. If no slides: static hero using the settings CTA image with heading "Shiv Narayan Choubisa College" and the session CTA.
4. QuickLinks: 4 fixed items (design system §5.9), "Admissions {session_label}" label from settings.
5. AboutIntro: from settings `about_*` + `facts` (2×2 grid of IconTile + text) + link to `/about`.
6. NoticeBoard: latest 6 notices (static list).
7. ProgrammesSection: centred header; ProgrammeCards in `max-w-5xl mx-auto grid md:grid-cols-2` (if 3+ programmes, use the standard 3-col grid).
8. WhyChoose: settings `why_items` (6), icons from a fixed whitelist map in code (`graduation-cap`, `flask-conical`, `library`, `wifi`, `hand-coins`, `briefcase`, `users`, `shield-check`).
9. LeadershipSection: `leaders` (max 2) as MessageCards side by side ≥lg.
10. NewsSection / LifeAtSnc / AffiliationStrip per spec. Affiliation logos only when official files are provided (else omit section).
11. `generateMetadata` + `CollegeOrUniversity` JSON-LD from settings.

**Acceptance criteria**
- [ ] Section order and backgrounds match §6.1; no two adjacent sections share a background.
- [ ] Every section has `py-16 md:py-24` (bands `py-8 md:py-10`), uses Container, and its left edge aligns with the logo.
- [ ] No merit-list filter, ticker, popup, stats with unverified numbers, or stock images.
- [ ] Hero: LCP image has `priority`; CLS < 0.05; slider fully keyboard operable; autoplay pauses on hover/focus.
- [ ] With WordPress returning empty lists, the homepage still looks complete (sections omitted cleanly).
- [ ] Lighthouse mobile: Perf ≥ 90, A11y ≥ 95, SEO ≥ 95 (with sample images).
- [ ] Screenshots at 360/768/1280/1440 saved and compared against §6.1 wireframe.
- [ ] Part C checks empty; lint/tsc/build pass.

**Do NOT:** add sections not in §6.1; change section order; animate on scroll.

---

### Phase 6 — Inner page templates & WordPress pages

**Goal:** Every prose page in the sitemap renders from WordPress with the correct template.

**Tasks**
1. `app/[...path]/page.tsx`: `const { path } = await params` → `getPage(path.join('/'))` → `notFound()` if null. Template: if `path.length === 1` and it is a `sectionRoot` → `LandingPageLayout` (intro prose + child-page InfoCards from `config/navigation.ts`); otherwise → `SectionPageLayout` (PageHero + SectionNav + Prose).
2. `generateStaticParams` from `getPaths().pages`; `dynamicParams = true` so new WP pages work without redeploy.
3. `generateMetadata` from page title/excerpt/hero image.
4. `app/about/messages/page.tsx`: SectionPageLayout with full messages from `getLeaders()` (portrait, name, designation, full message prose), separated by `border-t border-ink-200 pt-12 mt-12`.
5. `not-found.tsx` and `error.tsx` per design system §6.11.
6. Content entry: in WP, create/verify every page listed in §7.1 with migrated old-site content (no lorem ipsum), properly structured with H2/H3, lists and tables.

**Acceptance criteria**
- [ ] All "WP Page" routes in §7.1 resolve and show breadcrumbs, H1, sidebar (desktop) / dropdown (mobile) with correct active item.
- [ ] Section roots show landing layout with child cards.
- [ ] Prose: headings, lists, tables, images, blockquotes, file blocks all styled per §5.17; long tables scroll horizontally on mobile.
- [ ] Creating a new child page in WP under `/students` makes it reachable without rebuild.
- [ ] Unknown path → styled 404 with chrome.
- [ ] Part C checks empty; lint/tsc/build pass; screenshots of 3 representative pages saved.

**Do NOT:** create a separate route file for each prose page; hardcode page content in TSX.

---

### Phase 7 — Admissions, notices & document libraries

**Goal:** All document-driven pages (the heart of a college site) work with filters, per design system §5.14 and §6.5.

**Tasks**
1. `components/documents/DocumentFilters.tsx` (client): session select, programme segmented tabs, list-type select, category select, text search; state ↔ URL query via `useRouter`/`useSearchParams`; filters that have only one option are hidden.
2. `/admissions/merit-lists`: intro (from WP page `admissions/merit-lists` if present) + filters + DocumentList (columns: Title · Programme · Category · Type · Date · File). Default to the latest session. Server-side filtering via `getMeritLists(searchParams)`.
3. `/students/notices`: type tabs (All · Admission · Examination · Scholarship · Academic · Events · General), DocumentList (Title · Type · Date · File/Link), pagination (20/page), Important + New badges.
4. `/students/syllabus`, `/students/question-papers`, `/students/downloads`, `/iqac/reports`: DocumentList by `document_type`, grouped by session (accordion per year, latest open).
5. Pages that combine prose + documents (`/about/mandatory-disclosures`, `/iqac/naac`, `/iqac/ugc-compliance`, `/academics/academic-calendar`, `/admissions/fee-structure`, `/students/anti-ragging`): prose from WP page + DocumentList of the matching `document_type` below it. Implement by letting `[...path]` look up a `documentTypeForPath` map in `config/navigation.ts`.
6. `/admissions` landing: steps (numbered 1–4 cards), key dates (from WP page content), documents required (list), CTA (Apply, Call). One accent button allowed in PageHero.

**Acceptance criteria**
- [ ] Filtering merit lists by session/programme/type/category works, URL is shareable, back button restores filters.
- [ ] 50+ sample merit lists remain fast and readable; mobile shows stacked rows, not a squeezed table.
- [ ] Every file link shows type + real size and opens in a new tab with accessible label ("Download B.A. Merit List 1 (PDF, 420 KB), opens in new tab").
- [ ] Empty filters show EmptyState with the right message.
- [ ] Notices older than 7 days have no "New" badge.
- [ ] Part C checks empty; lint/tsc/build pass; screenshots saved.

**Do NOT:** link PDFs from the main navigation; build nested year/program menus (GMGC style); hand-type file sizes.

---

### Phase 8 — Academics, faculty & committees

**Tasks**
1. `/academics/programmes`: PageHero + ProgrammeCards grid (grouped UG / PG / Diploma if more than one level exists).
2. `/academics/programmes/[slug]`: design system §6.4 (overview, sticky At-a-glance card, subjects grid, career paths, syllabus download, Apply CTA). `generateStaticParams` from `getPaths().programmes`. Fee/intake shown only if WP fields are filled.
3. `/academics/faculty`: department Tabs + PersonCard grid; teaching first, then non-teaching (separate H2s).
4. `/iqac/committees`: session select + Accordion per committee (purpose, convener, members table, order PDF).
5. Programme JSON-LD (`Course`) on detail pages.

**Acceptance criteria**
- [ ] Only programmes present in WP appear (B.A., B.Sc. by default) — no B.Com/M.A. unless the college adds them.
- [ ] Faculty without photos show initials avatars, cards stay equal height.
- [ ] Committee members table scrolls on mobile; previous sessions selectable.
- [ ] Part C checks empty; lint/tsc/build pass; screenshots saved.

---

### Phase 9 — Campus life, news, gallery & contact

**Tasks**
1. `/news` (category tabs All · News · Events · Press Notes, NewsCard grid, pagination) and `/news/[slug]` (design system §6.8, `NewsArticle` JSON-LD).
2. `/campus-life/gallery` (AlbumGrid) and `/campus-life/gallery/[slug]` (PhotoGrid + `yet-another-react-lightbox` with captions, keyboard, swipe).
3. `/campus-life/videos`: WP page content; YouTube links rendered as click-to-load thumbnails (no iframe until click).
4. `/contact`: design system §6.10 — InfoCards, EnquiryForm (server action → `submitEnquiry`, `useActionState`, inline validation, honest error state), lazy Google Map iframe with `title`, office hours.
5. EnquiryForm is also used on `/admissions/apply` below the prose.

**Acceptance criteria**
- [ ] Gallery lightbox: keyboard (←/→/Esc), focus returns to the clicked tile, images lazy-loaded.
- [ ] Enquiry: client + server validation (10-digit mobile), success replaces form, failure shows the phone number; submission appears in wp-admin "Enquiries" and email is sent.
- [ ] Map does not load until near viewport (`loading="lazy"`).
- [ ] Part C checks empty; lint/tsc/build pass; screenshots saved.

---

### Phase 10 — SEO, redirects, QA & launch

**Tasks**
1. `next.config.ts` `redirects()` — every row of design system §7.3 as `permanent: true`; plus `/wp-content/uploads/:path*` → media host.
2. `app/sitemap.ts` (all routes from `getPaths()` + static routes) and `app/robots.ts` (allow all, sitemap URL; disallow `/styleguide`, `/api`).
3. `generateMetadata` audit: unique title + description on every route; OG image fallback from settings.
4. Full accessibility pass (axe DevTools or Lighthouse) on: home, a section page, merit lists, notices, programme detail, faculty, gallery album, contact. Fix all serious/critical issues.
5. Performance pass: Lighthouse mobile on the same pages; meet design system §10 budget.
6. Cross-browser: Chrome, Firefox, Safari (iOS), Samsung Internet (Android). Verify mobile action bar safe-area on iOS.
7. Content audit with the college: walk every page; replace every `[SAMPLE]` item; confirm all facts in design system §8.3 marked "confirm".
8. Production: environment variables set; WP `SNC_FRONTEND_URL` points to production; revalidation tested end-to-end; WP noindex; `autologin.php` absent on server; backups configured for WP DB + uploads.

**Acceptance criteria**
- [ ] Every old URL in §7.3 returns 301 to the right page.
- [ ] Lighthouse mobile ≥ 90 / 95 / 95 / 95 on all audited pages (scores pasted into PROGRESS.md).
- [ ] Zero `[SAMPLE]` content in production (`/wp-json/snc/v1/*` grep for "[SAMPLE]" returns nothing).
- [ ] Zero console errors on every audited page.
- [ ] Owner sign-off recorded in PROGRESS.md.

---

## Part F — Owner decisions & content still needed

Record answers in `docs/PROGRESS.md` under "Decisions". Items marked ★ block launch, not development.

| # | Question | Default if no answer |
|---|----------|----------------------|
| 1 ★ | Exact programme list (B.A., B.Sc. confirmed; M.A., B.Com, BCA, PGDCA, M.Sc. mentioned inconsistently on old site) | Publish only B.A. and B.Sc. |
| 2 ★ | NAAC status and AISHE code | Mention neither as achieved |
| 3 ★ | Official emblem/logo files (transparent PNG or SVG) | Use current `emblem.jpg` |
| 4 ★ | Real photographs (campus, labs, library, events) and hero banners | ImagePlaceholder / static hero |
| 5 ★ | Principal's name, photo and message; Chairman's photo; founder name spelling ("Prashant" vs "Prasshant") | Chairman only, "Prashant" |
| 6 | Show fees publicly? (official fee document) | Hide `/admissions/fee-structure` |
| 7 | Admission form: external portal link (GGTU/state portal) or college form? | Link from settings `apply_url` |
| 8 | Hosting: Vercel vs VPS for Next.js; subdomain for WordPress | Next on main domain, WP on `cms.` |
| 9 | Want "Contact" in main nav instead of "Home"? | No |
| 10 | Site search needed? | No (phase 2 project) |
| 11 | Hindi version of the site needed? | No (English with Hindi name) |
