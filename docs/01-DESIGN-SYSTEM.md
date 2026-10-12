# SNC College Website — Design System & Specification

**Project:** Redesign of https://snccollegedpr.in (Shiv Narayan Choubisa College, Simalwara, Dungarpur)
**Stack:** Next.js 16 (App Router) + Tailwind CSS v4 frontend · Headless WordPress backend
**Visual reference:** https://madhavuniversity.edu.in
**Structure references:** https://snccollegedpr.in (content), https://gmgcudaipur.org (admissions / governance document patterns)
**Version:** 1.0 · 2026-10-09
**Companion document:** `docs/02-IMPLEMENTATION-PLAN.md` (phases, tasks, acceptance criteria)

---

## 0. How to use this document (read first)

This document is the **single source of truth** for how the site looks and behaves. Anyone (human or AI agent) building UI must follow it exactly.

- **MUST / MUST NOT** = hard rules. Breaking them is a defect, even if the result "looks fine".
- **SHOULD** = default; deviate only with a written reason in the PR/commit.
- Exact Tailwind class strings are given for core components. Use them as written. Do not "improve" them.
- If something is not covered here, pick the simplest option that matches existing components, and add it to this document in the same change.
- When this document and the current code disagree, **this document wins**.

### Non-negotiables (summary)

1. Clean, quiet, institutional. It must look like a serious Indian college website, not a startup landing page.
2. Generous whitespace. Every section uses the standard section padding (§4.3). No cramped blocks.
3. Two colours (navy + gold) on neutral greys/white. No other brand colours, no gradients on text, no glow shadows.
4. Two font families only (Merriweather + Plus Jakarta Sans), loaded via `next/font`.
5. **No invented facts.** No fake fees, seat counts, accreditation grades, statistics, testimonials, or programmes. If WordPress has no data, render an empty state or hide the section.
6. No auto-opening popups, no blinking text, no marquee tickers, no infinite decorative animations.
7. Every page is fully usable at 360 px wide and by keyboard only.

---

## 1. Why the current build is being replaced

Audit of `frontend/` as of 2026-10-09. These are the causes of the "cramped, misaligned, unprofessional" result. Each one is addressed by a rule in this document.

| # | Problem | Evidence | Fix (rule) |
|---|---------|----------|-----------|
| 1 | **Spacing utilities are silently disabled.** | `app/globals.css` has an unlayered `* { margin: 0; padding: 0; }`. In Tailwind v4 all utilities live in `@layer utilities`; unlayered CSS always beats layered CSS, so `p-6`, `px-4`, `mb-12`, `mt-*`, `space-y-*` etc. are overridden to `0`. This alone explains most of the "everything is stuck together" look. | §3.6 — never write unlayered element/universal resets. Tailwind's preflight already resets. |
| 2 | Three font families (Merriweather, Outfit, Plus Jakarta Sans) loaded via `<link>` | `app/layout.tsx` | §3.2 — two families via `next/font`. |
| 3 | Colours applied with inline `style={{ background: 'var(--…)' }}` mixed with arbitrary Tailwind colours (`amber-600`, `slate-*`, `green-400`) | `Header.tsx`, `page.tsx` | §3.1 — tokens in `@theme`, used only as Tailwind classes. |
| 4 | Decorative noise: rotating conic-gradient "Apply" border, blinking "Live Updates" tag, marquee ticker, hover scale-110 images, `rounded-3xl` everywhere, `shadow-2xl` | `globals.css`, `Header.tsx`, `page.tsx` | §3.4, §3.5, §9 banned list. |
| 5 | **Fabricated content** shown as fact: fees (₹9,500/yr…), seat counts, B.Com and M.A. programmes, "100% placement", "5,000+ students", "NAAC Accredited", a second phone number, and AISHE code `C-39947` — which is actually **Government Meera Girls College Udaipur's** AISHE code (it appears in gmgcudaipur.org PDF file names). | `lib/wp.ts` fallbacks, `scratch/seed_initial_data.php` | §8 content rules. All fallback "fake" data is deleted. |
| 6 | Homepage overloaded and in the wrong order (merit-list filter engine as section 3 of the homepage) | `app/page.tsx` | §6.1 homepage spec. Merit lists live on `/admissions/merit-lists`. |
| 7 | Stock Unsplash photos presented as SNC's own facilities | `app/page.tsx` | §3.8 imagery rules. |
| 8 | Header crams ticker + phone + WhatsApp + AISHE badge into one thin bar; 13 px nav on a white bar with no structure | `Header.tsx` | §5.4–5.6 header spec. |

**Decision:** All existing components under `frontend/components/`, `frontend/context/` and all page files are discarded and rebuilt from this specification. `lib/wp.ts` is rewritten. The WordPress plugin `wp-content/plugins/snc-core-headless` is kept as a starting point but its content model is revised (see Implementation Plan, Phase 3).

---

## 2. Reference analysis

### 2.1 Madhav University (visual reference) — measured, not guessed

Source: live HTML and `/static/styles/madhav_css_main.css` (Tailwind build) fetched 2026-10-09.

**Foundations**
- Built with Tailwind. Fonts: **Plus Jakarta Sans** (body/UI) + **Merriweather** (serif display headings, used at `font-black`).
- Palette: saffron-orange `#e9842c` (their primary, class `mu-maroon`), deeper orange `#e67818`, gold `#d4af37`, near-black `#1a1a1a` (footer), greys from Tailwind `gray-*`. Hover tints use `red-50`.
- Container: `container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl` (1280 px) on **every** section. This consistency is the main reason it looks aligned.
- Section rhythm: `py-20` / `py-24` (80–96 px) for main sections, `py-12` for thin bands. Alternating `bg-white` / `bg-gray-50`. Section headers centred, `max-w-3xl mx-auto`, `mb-12`–`mb-20` before content.
- Grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8` is the default card grid.

**Header anatomy (top to bottom)**
1. **Utility bar** — `bg-gray-900 text-gray-400 text-xs py-2`. Left: ~10 short quick links (IQAC, Infra, Videos, Life at MU, Library, NAAC, NAD/ABC, Placement, Helpline). Right: social icons.
2. **Main bar** — `bg-white/95 backdrop-blur-md shadow-md h-20`. Left: logo (`w-28 md:w-[10em]`) → thin vertical divider (`h-10 w-px bg-gray-300`) → accreditation logos (NAAC, Study in India). Right: nav + "Apply Now".
3. **Nav** — visible only at `xl` (≥1280 px). Items: `px-3 py-2 text-sm font-bold text-gray-700 uppercase tracking-wide`. Top-level: Home · About · Academics · Admissions · Faculties · Committees.
4. **Mega menu** — `absolute top-full w-[500px] bg-white shadow-xl border-t-4 border-[primary] rounded-b-lg`. Two halves: left = link list (`px-6 py-2 text-sm text-gray-600`, hover: tinted bg + `border-l-2` primary), right = photo panel with a short tagline ("Legacy of Excellence · Est. 2014"). "Faculties" uses a 3-column grouped list with group headings.

**Homepage order**
1. Full-width **image banner slider** (designed banner images, separate desktop/mobile `<picture>` sources, arrows + dots).
2. "Why Choose …" — 6 cards in a 3-col grid, each card = heading + 3 short bullet points.
3. "Faculties" — 3 grouped cards with link lists.
4. Partner/recruiter logo band (`py-12 bg-gray-900`).
5. Registration CTA band — fixed background photo with dark overlay.
6. Scholarship band.
7. Latest blogs — 3-col cards.
8. "Life @ MU" — bento photo grid (`grid-cols-2 md:grid-cols-4 grid-rows-2 h-[600px] gap-4`).
9. Instagram feed, testimonials (3 cards).
10. Footer — `bg-[#1a1a1a] pt-20 pb-12 border-t-8 border-[primary]`, 3 columns (Quick Links, Important Links, Helpline + Address), bottom bar with policies.

**Inner page anatomy**
- Page hero: `bg-gray-900 text-white py-24` with breadcrumb ("Home › Committee") and H1, optional one-line subtitle.
- Content sections: `py-16 md:py-24 bg-white`, eyebrow (H3/H4 small caps) → H2 → body; image + text splits; stat blocks.

**What we adopt:** the container discipline, section rhythm, header anatomy (utility bar → white main bar → mega menu with image panel), dark page hero on inner pages, 3-col card grids, CTA band, bento gallery, dark footer with coloured top border, serif headings + sans body.

**What we do NOT adopt:** blurred gradient blobs and "cubes" texture backgrounds, the auto-opening "NAAC A Grade" celebration popup and newsletter modal, the Instagram embed, the convocation strip pinned above the header, scale-on-hover badges, `text-[160px]` decorative numerals. These add noise and are banned here (§9).

### 2.2 Old SNC site (content and IA source)

Menu on snccollegedpr.in (2026-10-09):

```
Home
About ─ Message · Infrastructure · College Committee · Affiliations · Our Values (Vision & Mission · Ladder of Success · Philosophy)
Activities ─ Support & Guidance · NAAC · IQAC · Placement Cell · Student Grievance Redressal Cell ·
             Anti-Ragging Committee & Undertaking · Mandatory Disclosures · Faculty/Staff Details ·
             Examination Section · Academic Calendar · UGC/Statutory Bodies Compliance
Courses
Scholarship
Student Corner ─ Admission · Admission Form · Syllabus · Old Question Papers · Migration Nodal
Gallery ─ Photo Gallery · Video Gallery · Press Note · Alumni
Contact Us
```

Problems: governance items (NAAC, IQAC, disclosures) hidden under "Activities"; lorem ipsum left on About/Message/Admission/Committee/Infrastructure pages; empty pages (Faculty/Staff, Examination); inconsistent programme lists (see §8.3).

### 2.3 Government Meera Girls College, Udaipur (structure source)

Useful patterns to adopt:
- **Admissions organised by session year** (2026-27, 2025-26 …) → list type (Merit / Waiting / Provisional Admitted / Final Admitted) → programme → category (General, OBC, SC, ST, EWS, MBC, Divyang). GMGC does this with 5-level nested menus; **we do it with one filterable documents page** instead (§5.14).
- Year-wise PDF archives for committees, AISHE reports, college bulletins.
- Dedicated top-level **IQAC** area (Introduction, Initiatives, AQAR & Downloads, Minutes, Feedback Forms, Accreditation) and **NIRF**.
- **Student Corner** gathering exam results, forms, scholarship, grievance, code of conduct, time tables, anti-ragging, ICC.
- **Activities** as a group: NSS, NCC, Rangering, Placement, Alumni, Cultural, Literary, Sports, Student Union.

What we do NOT adopt: 5-level dropdown menus, PDFs linked directly from the menu, Hindi/English mixed menu labels, three-plus font families.

---

## 3. Design tokens

All tokens are defined once in `frontend/app/globals.css` inside Tailwind v4's `@theme` block, so they become utilities (`bg-primary-900`, `text-gold-500`, `font-serif` …). **Components MUST use these utilities, never hex values, inline `style` colours, or Tailwind's default palette names (`amber-*`, `slate-*`, `blue-*`, etc.).** Tailwind's `gray-*` neutrals are replaced by our `ink-*` scale.

### 3.1 Colour

Brand colours are taken from the SNC emblem (deep navy field, gold laurel/lettering). Gold is the same family as Madhav's accent `#d4af37`, which keeps the visual kinship with the reference.

| Token | Hex | Use |
|-------|-----|-----|
| `primary-950` | `#061633` | Utility bar, footer, page hero background |
| `primary-900` | `#0A2152` | Header CTA hover, dark bands, notice-board header |
| `primary-800` | `#0F2D6B` | **Primary brand colour.** Primary buttons, links, active nav, icons |
| `primary-700` | `#1A3E87` | Hover state of primary-800 |
| `primary-100` | `#E3EAF6` | Icon tile backgrounds, active sidebar item |
| `primary-50`  | `#F2F5FB` | Subtle hover backgrounds (menu items, table rows) |
| `gold-600` | `#A8841F` | Gold borders/icons on white (decorative only, **not** body text) |
| `gold-500` | `#C9A227` | **Accent.** "Apply Now" button fill, top border of footer & mega menu, eyebrow rule, focus ring |
| `gold-400` | `#DDB948` | Gold text on dark (`primary-950/900`) backgrounds, hover of gold button |
| `gold-100` | `#F6EDCF` | "Important" badge background |
| `gold-50`  | `#FBF7EA` | Rare soft highlight panels |
| `ink-900` | `#111827` | Headings |
| `ink-700` | `#374151` | Body text |
| `ink-500` | `#6B7280` | Secondary text, captions, meta (dates) |
| `ink-300` | `#D1D5DB` | Input borders, dividers on grey |
| `ink-200` | `#E5E7EB` | Card borders, section dividers |
| `ink-100` | `#F3F4F6` | Table header backgrounds |
| `ink-50`  | `#F9FAFB` | Alternate section background |
| `white` | `#FFFFFF` | Default surface |
| `danger-700` | `#B91C1C` | "New" badge, form errors |
| `success-700` | `#15803D` | Form success, "Open" status |
| `whatsapp` | `#25D366` | WhatsApp button/icon only (`bg-whatsapp`, `text-whatsapp`) |

**Colour rules**
- Page surfaces alternate `bg-white` and `bg-ink-50`. Dark (`primary-950`) is used only for: utility bar, page hero, CTA band overlay, footer. Never two dark sections adjacent.
- Gold is an accent. At most **one gold-filled element per viewport** (normally the "Apply Now" button).
- Text on white: `ink-900` headings, `ink-700` body, `ink-500` meta. Links `primary-800` → hover `primary-700` + underline.
- Text on `primary-950/900`: white headings, `text-white/80` body, `gold-400` eyebrows/links.
- Gold text on white is not allowed (fails WCAG AA contrast). Use `primary-800` instead.
- No gradients except the photo overlays defined in §5.8 and §5.12.

### 3.2 Typography

| Role | Family | Loaded as |
|------|--------|-----------|
| Display & headings (H1, H2, page hero, card titles in "message" blocks) | **Merriweather** 700 | `next/font/google`, variable `--font-merriweather`. Weight 900 is **not** loaded: nothing uses `font-black` (this document bans it outside an optional hero title) and the extra file delayed the text LCP by ~0.3 s. Add `'900'` back only if a hero title actually needs it. |
| Body, UI, nav, buttons, H3–H6 | **Plus Jakarta Sans** 400, 500, 600, 700 | `next/font/google`, variable `--font-jakarta` |
| Hindi (Devanagari) fallback only | System fonts: Nirmala UI (Windows), Noto Sans Devanagari (Android), Kohinoor Devanagari (iOS/macOS) | Listed in the `--font-sans` stack after Plus Jakarta Sans; no web font download. (The Noto web font via `next/font` fails under Turbopack in Next 16.4, so do not add it back.) |

Load with `display: 'swap'`, `subsets: ['latin']`. No `<link>` tags to Google Fonts. No other families.

**Type scale** (mobile → desktop). Use these combinations only.

| Style | Classes |
|-------|---------|
| Hero title | `font-serif font-bold text-3xl leading-tight md:text-5xl md:leading-[1.15]` |
| H1 (page hero) | `font-serif font-bold text-3xl leading-tight md:text-[2.75rem] md:leading-[1.2]` |
| H2 (section title) | `font-serif font-bold text-[1.75rem] leading-snug md:text-4xl md:leading-tight text-ink-900` |
| H3 (card / sub-section) | `font-sans font-bold text-lg md:text-xl leading-snug text-ink-900` |
| H4 | `font-sans font-semibold text-base md:text-lg text-ink-900` |
| Eyebrow | `font-sans font-bold text-xs uppercase tracking-[0.16em] text-primary-800` (on dark: `text-gold-400`) |
| Lead paragraph | `text-base md:text-lg leading-relaxed text-ink-700` |
| Body | `text-base leading-7 text-ink-700` |
| Small / meta | `text-sm leading-6 text-ink-500` |
| Caption | `text-xs leading-5 text-ink-500` |
| Nav item | `text-[13px] font-bold uppercase tracking-wide` |
| Button | `text-sm font-semibold` |

Rules: paragraphs max width `65ch` (`max-w-prose`); never `max-w-3xl` for running text. Never set body text below 14 px. Never use `font-black` (900) on anything except optional hero title. No all-caps sentences longer than 4 words.

### 3.3 Spacing (8-point system)

Use only Tailwind steps: `1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24` (4 px – 96 px). No arbitrary spacing values like `mt-[13px]`.

| Context | Value |
|---------|-------|
| Section vertical padding | `py-16 md:py-24` (64 / 96 px) — **every** full section |
| Thin band (stat strip, logo strip, quick links) | `py-8 md:py-10` |
| Section header → content | `mb-10 md:mb-14` |
| Eyebrow → H2 | `mb-3` |
| H2 → description | `mt-4` |
| Card grid gap | `gap-6 lg:gap-8` |
| Card inner padding | `p-6 md:p-8` (compact list cards: `p-5`) |
| Stack of paragraphs | `space-y-4` (prose handles its own) |
| Form field gap | `gap-5`, label → input `mb-2` |
| Button group gap | `gap-3` |

### 3.4 Radius, borders, shadows

| Token | Use |
|-------|-----|
| `rounded-md` (6 px) | Buttons, inputs, badges, small tiles |
| `rounded-xl` (12 px) | Cards, image containers, notice board, sidebar nav |
| `rounded-full` | Avatars, icon circles, WhatsApp button, slider dots only |
| Border | `border border-ink-200` on all cards on white; on `bg-ink-50` sections cards are `bg-white border border-ink-200` |
| Shadow | Default `shadow-sm`. Hover on interactive cards: `hover:shadow-md`. Header: `shadow-sm`. Mega menu: `shadow-xl`. Nothing else. |

Banned: `rounded-2xl`, `rounded-3xl`, `rounded-[2rem]`, `shadow-2xl`, coloured shadows, `ring` glows, `backdrop-blur` (except the sticky header, see §5.5).

### 3.5 Motion

- Transitions: `transition-colors` or `transition-[box-shadow,transform]`, `duration-200`, `ease-out`.
- Hover lift on interactive cards: `hover:-translate-y-0.5` max. Image zoom on hover: `group-hover:scale-[1.03]` max, `duration-500`.
- Hero slider autoplay 6 s, pauses on hover/focus, disabled under `prefers-reduced-motion`.
- Mega menu: opacity + 4 px translate, 150 ms.
- **Banned:** infinite animations (marquee, pulse, ping, blink, rotating borders, bouncing arrows), parallax scroll effects other than the CTA band's `bg-fixed` on ≥lg, count-up number animations, scroll-triggered fade-ins on every element.
- Wrap all motion in `motion-safe:` or respect `prefers-reduced-motion`.

### 3.6 Global CSS rules

`frontend/app/globals.css` contains only:
1. `@import "tailwindcss";`
2. `@theme { … }` with the tokens above (colours, `--font-serif`, `--font-sans`).
3. `@layer base { … }` for: `html` font smoothing + `scroll-behavior: smooth` (guarded by reduced-motion), `body` `bg-white text-ink-700 font-sans`, heading colour, `:focus-visible` outline (`2px solid var(--color-gold-500)`, offset 2px), `::selection`.
4. `@layer components { .prose-snc … }` — typography for WordPress HTML (§5.17).
5. Nothing else. **No unlayered rules. No `* { margin:0; padding:0 }`. No custom keyframes.** (Slider/lightbox libraries bring their own CSS.)

### 3.7 Icons

`lucide-react` only, with one exception: lucide-react 1.x ships **no brand icons**, so Facebook, Instagram, YouTube and WhatsApp marks live as small inline SVG components in `components/icons/social.tsx` (official single-path marks, `fill="currentColor"`). Sizes: 16 (inline/meta), 20 (buttons, nav, lists), 24 (feature tiles). `strokeWidth={1.75}`. Icons in feature tiles sit in `size-12 rounded-md bg-primary-100 text-primary-800 grid place-items-center`. No emoji anywhere in UI or content.

### 3.8 Imagery

- **Only real SNC photographs** in production (campus, labs, events, people). Stock photos are banned in production. During development use the `<ImagePlaceholder>` component (flat `bg-ink-100` box with an image icon and the intended aspect ratio) — never Unsplash.
- Always `next/image` with explicit `sizes`. Hero first slide `priority`.
- Aspect ratios: hero desktop 16:6 (source 1920×720), hero mobile 4:5 (1080×1350), cards 16:10, news 16:9, gallery tiles 1:1 and bento cells, portraits 4:5, logos contain-fit.
- Photo overlays only: `bg-gradient-to-r from-primary-950/85 via-primary-950/55 to-transparent` (hero text) or `bg-primary-950/80` (CTA band). No other overlays.
- All images require meaningful `alt` (decorative images `alt=""`).

---

## 4. Layout

### 4.1 Breakpoints
Tailwind defaults: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. Design at 360, 768, 1024, 1280, 1440.

### 4.2 Container
Every section's content is wrapped in `<Container>`:
```
mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8
```
`max-w-8xl` is **90rem / 1440px**, defined as `--container-8xl` in `@theme` (owner's decision, 2026-10-10). It replaced `max-w-7xl` (1280px), which left ~128px of empty margin on each side of a 1536px screen and — because the viewport grew while the content box did not — squeezed the header brand until the college name overflowed under the nav at `2xl`. Running text is unaffected: `.prose-snc` still caps paragraphs at 65ch (§5.17).
Narrow variant for reading pages / forms: `max-w-4xl`. **No section may define its own container width or horizontal padding.** This is the #1 alignment rule: all left edges (logo, headings, cards, footer columns) line up on the same vertical line.

### 4.3 Section
```
<section class="py-16 md:py-24 {bg-white | bg-ink-50}">
  <Container>
    <SectionHeader …/>   <!-- mb-10 md:mb-14 -->
    …content…
  </Container>
</section>
```

### 4.4 Grids
- Cards: `grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8`
- 4-up (quick links, stats): `grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4`
- Split (text + media / content + sidebar): `grid gap-10 lg:grid-cols-12 lg:gap-12` with `lg:col-span-7` / `lg:col-span-5` (or 3 / 9 for sidebar layout).
- Vertical alignment in splits: `items-center` for text+image, `items-start` for content+sidebar.

---

## 5. Components

Each component lives in `frontend/components/` (see folder structure in the Implementation Plan). Props are typed; no component fetches data itself except where stated.

### 5.1 Button
Base: `inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:opacity-50`

| Variant | Classes |
|---------|---------|
| `primary` | `bg-primary-800 text-white hover:bg-primary-700` |
| `accent` (Apply Now only) | `bg-gold-500 text-primary-950 hover:bg-gold-400` |
| `outline` | `border border-primary-800 text-primary-800 hover:bg-primary-50` |
| `outline-light` (on dark) | `border border-white/70 text-white hover:bg-white/10` |
| `link` | `text-primary-800 hover:text-primary-700 hover:underline underline-offset-4 px-0` + trailing `ArrowRight` 16 |

Sizes: `sm` `h-9 px-4` · `md` `h-11 px-5` (default) · `lg` `h-12 px-7 text-base`.
Renders `next/link` when `href` is internal, `<a target="_blank" rel="noopener noreferrer">` when external (with sr-only "(opens in new tab)").

### 5.2 SectionHeader
Props: `eyebrow?`, `title`, `description?`, `align: 'left' | 'center'` (default `left`), `action?` (link).
- Left aligned: eyebrow row has a `h-0.5 w-8 bg-gold-500` rule before the eyebrow text (`flex items-center gap-3`).
- Centered: `text-center mx-auto max-w-3xl`, gold rule *below* the title (`mx-auto mt-5 h-0.5 w-12 bg-gold-500`).
- With `action`: `flex flex-col gap-6 md:flex-row md:items-end md:justify-between`; action is a `link` button.
- Wrapper bottom margin `mb-10 md:mb-14`.

### 5.3 Badge
`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold`
- `new`: `bg-danger-700 text-white` (text "New")
- `important`: `bg-gold-100 text-primary-950`
- `neutral`: `bg-ink-100 text-ink-700`
- `info`: `bg-primary-100 text-primary-800`

### 5.4 Utility bar (`TopBar`)
- `hidden lg:block bg-primary-950 text-white/75 text-xs` · inner `<Container>` `flex h-10 items-center justify-between`.
- Left: up to **6** text links separated by `gap-5`: IQAC · NAAC · Mandatory Disclosures · Notices · Alumni · Student Helpline. Hover `text-gold-400`.
- Right: phone (Phone icon 14) · email (Mail icon 14) · divider `h-4 w-px bg-white/20` · social icons (Facebook, Instagram, YouTube) 16 px.
- Not sticky. Hidden below `lg`. No ticker, no badges.

### 5.5 Header (`SiteHeader`)
- Wrapper: `sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-ink-200 shadow-sm`.
- Inner: `<Container>` `flex h-16 items-center justify-between gap-6 lg:h-20`.
- **Brand block** (left, `flex items-center gap-3`, is a link to `/`):
  - Emblem `size-12 lg:size-14` (`next/image`, the round SNC seal, no extra border/ring).
  - Text: line 1 `font-serif font-bold text-[15px] leading-tight text-primary-950 sm:text-lg` "Shiv Narayan Choubisa College"; line 2 `text-[11px] sm:text-xs text-ink-500` "Simalwara, Dungarpur · Affiliated to GGTU, Banswara". Below `sm`, line 2 is hidden.
  - Optional (only if client supplies official logo files): `hidden xl:block h-10 w-px bg-ink-200` divider then affiliation logos `h-10 w-auto`.
- **Desktop nav** (`hidden xl:flex items-center gap-1`, `h-full`): 7 items (§7.2). Item: `relative flex h-full items-center px-3 text-[13px] font-bold uppercase tracking-wide text-ink-700 hover:text-primary-800`. Active section: `text-primary-800` + `after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-gold-500`. Items with children show `ChevronDown` 14.
- **Right actions**: `Apply Now` (Button accent, size `md`, hidden below `sm`) · hamburger button `xl:hidden size-11 rounded-md border border-ink-200` (`Menu` icon 22, aria-label "Open menu", aria-expanded).
- Header height never changes on scroll (no shrinking logos).

### 5.6 Mega menu (`MegaMenu`)
- Opens on hover (with 120 ms open / 200 ms close delay) **and** on click/Enter/Space; closes on Escape, outside click, route change. Uses `aria-expanded`, `aria-controls`; links are focusable in order; Escape returns focus to trigger.
- Panel: `absolute left-0 top-full w-[560px] rounded-b-xl border-t-4 border-gold-500 bg-white shadow-xl` (wide variant for Academics/Students: `w-[720px]`, right-aligned items use `right-0 left-auto`).
- Layout: `grid grid-cols-[1fr_200px]`.
  - Left: link list `py-4`. Link: `flex items-center border-l-2 border-transparent px-6 py-2.5 text-sm text-ink-700 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800`. Wide variant: two columns with group headings `px-6 pt-3 pb-1 text-xs font-bold uppercase tracking-[0.14em] text-ink-500`.
  - Right: image panel `relative` with photo (`object-cover`), overlay `bg-primary-950/70`, bottom text: tagline `text-xs uppercase tracking-[0.16em] text-gold-400` + title `font-serif text-lg text-white`. Optional single CTA link.
- Max **10** links per menu. No third-level nesting anywhere in navigation.

### 5.7 Mobile navigation (`MobileNav`)
- Full-height drawer from the right, `w-full max-w-sm bg-white`, overlay `bg-primary-950/50`. Focus trapped; Escape and overlay click close; body scroll locked.
- Drawer header: emblem + "Menu" + close button (`X`, size-11).
- Body: accordion list. Top-level row `flex h-14 items-center justify-between border-b border-ink-200 px-5 text-[15px] font-semibold text-ink-900`; children `pl-8 py-3 text-sm text-ink-700`.
- Footer of drawer: Apply Now (accent, full width), then phone + WhatsApp buttons (outline, half width each).

### 5.8 Hero slider (`HeroSlider`) — homepage only
- Data: `hero_slide` items from WordPress (max 5). Library: Embla Carousel.
- Each slide: `<picture>`-equivalent via two `next/image` (desktop `hidden md:block`, mobile `md:hidden`).
- Frame: `relative w-full overflow-hidden bg-primary-950 aspect-[4/5] md:aspect-[16/7] lg:aspect-[16/6] lg:max-h-[640px]`.
- If the slide has text (`heading` set): overlay `absolute inset-0 bg-gradient-to-r from-primary-950/85 via-primary-950/55 to-transparent`; text block inside `<Container>` `absolute inset-0 flex items-end pb-16 md:items-center md:pb-0`, content `max-w-xl`: eyebrow (gold-400) → hero title (white) → `mt-4 text-base md:text-lg text-white/85` → buttons `mt-8 flex flex-wrap gap-3` (accent + outline-light).
- If the slide is a designed banner (no `heading`): image only, whole slide is a link if `link_url` is set.
- Controls: prev/next `size-11 rounded-full bg-white/15 text-white hover:bg-white/25` at `left-4/right-4` vertically centred, `hidden md:grid`; dots bottom-centre `h-2 w-2 rounded-full bg-white/50`, active `w-6 bg-gold-500`. All controls have aria-labels. One slide → no controls, no autoplay.

### 5.9 Quick access strip (`QuickLinks`) — homepage, directly under hero
- `bg-primary-900` band, `<Container>` `grid grid-cols-2 lg:grid-cols-4 divide-white/10 lg:divide-x`.
- 4 items exactly: Admissions 2026-27 → `/admissions` · Merit Lists → `/admissions/merit-lists` · Notices → `/students/notices` · Scholarships → `/admissions/scholarships`.
- Item: `group flex items-center gap-4 px-4 py-6 lg:px-8 text-white hover:bg-primary-800` with icon 24 in `text-gold-400`, label `font-semibold`, sub-label `text-xs text-white/60`, `ArrowRight` that moves `group-hover:translate-x-0.5`.

### 5.10 Page hero (`PageHero`) — every inner page
- `relative bg-primary-950 text-white` · optional background photo at `opacity-20` `object-cover` behind.
- `<Container>` `py-14 md:py-20`.
- Breadcrumbs (§5.11) `mb-5` → H1 (white) → optional subtitle `mt-4 max-w-2xl text-base md:text-lg text-white/75`.
- No decorative strips, shapes or patterns inside or under the hero.
- Left aligned. Never centred. Never contains buttons except on Admissions landing (one accent button allowed).

### 5.11 Breadcrumbs
`nav aria-label="Breadcrumb"` · `ol flex flex-wrap items-center gap-2 text-sm text-white/70` · separator `ChevronRight` 14 `text-white/40` · current page `text-white font-medium` with `aria-current="page"`. Emit `BreadcrumbList` JSON-LD.

### 5.12 CTA band (`CtaBand`)
- `relative isolate overflow-hidden` · photo `absolute inset-0 -z-10 object-cover` · overlay `absolute inset-0 -z-10 bg-primary-950/80` · on `lg` the image may use `bg-fixed` via CSS background (disabled below lg).
- `<Container>` `py-16 md:py-24 text-center` · eyebrow (gold-400) · H2 white · `mt-4 text-white/80 max-w-2xl mx-auto` · buttons `mt-8 flex flex-wrap justify-center gap-3` (accent "Apply Now", outline-light "Call Admission Cell").

### 5.13 Cards

All cards: `rounded-xl border border-ink-200 bg-white shadow-sm`. Interactive cards add `transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md` and the whole card is one link (single `<a>` wrapping, or stretched link via `after:absolute after:inset-0`). Never nest links.

| Card | Anatomy |
|------|---------|
| **FeatureCard** (Why choose SNC) | `p-6 md:p-8` · icon tile (§3.7) · `mt-5` H3 · `mt-2` body `text-sm leading-6` (max 2 lines of ~25 words). Not interactive. |
| **ProgrammeCard** | image 16:10 top (`rounded-t-xl overflow-hidden`) · body `p-6 md:p-8`: Badge info (level "Undergraduate") · H3 programme name · meta row `mt-3 flex gap-4 text-sm text-ink-500` (Clock "3 years" · BookOpen "Semester pattern") · `mt-4` subjects as `flex flex-wrap gap-2` neutral badges · footer `mt-6 pt-6 border-t border-ink-200` link "View programme". **No fee or seat count unless the value comes from WordPress.** |
| **NewsCard** | image 16:9 · `p-6`: meta (`CalendarDays` 16 + date, category badge) · `mt-3` H3 (2-line clamp) · `mt-2` excerpt (3-line clamp) · link. |
| **PersonCard** (faculty) | `p-6 text-center`: portrait `size-28 mx-auto rounded-full object-cover` (or initials avatar `bg-primary-100 text-primary-800 font-serif text-2xl`) · H3 `mt-4 text-base` · designation `text-sm text-primary-800 font-medium` · department `text-sm text-ink-500` · qualification `mt-2 text-xs text-ink-500`. No phone numbers or personal emails shown unless WP field `public_contact` is true. |
| **MessageCard** (Chairman/Principal) | `grid md:grid-cols-[180px_1fr] gap-6 p-6 md:p-8`: portrait 4:5 `rounded-lg` · quote mark `Quote` icon 28 `text-gold-500` · excerpt `font-serif text-lg leading-8 text-ink-900` (max ~60 words) · name `mt-5 font-semibold text-ink-900` · designation `text-sm text-ink-500` · link "Read full message". |
| **TestimonialCard** | `p-6 md:p-8` · quote text `text-ink-700 leading-7` · `mt-6 flex items-center gap-3` avatar 44 + name + programme/batch. |
| **InfoCard** (contact, facility) | icon tile · H3 · body / list. |

### 5.14 Document list (`DocumentList`) — notices, merit lists, syllabus, reports, disclosures
The core "college" component. Replaces GMGC's nested PDF menus.

- **Filter bar** (only when the list has >8 items): `flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6`. Controls: Session `<select>` (default = latest), programme segmented tabs (`All · B.A. · B.Sc.`), list-type select (Merit, Waiting, Provisional Admitted, Final Admitted), search input (filters by title, client-side). Filters sync to URL query (`?year=2026-27&program=ba`), so links are shareable.
- **Desktop (md+) table**: `w-full overflow-hidden rounded-xl border border-ink-200 bg-white text-sm`. Header `bg-ink-100 text-left text-xs font-bold uppercase tracking-wide text-ink-500`, cells `px-5 py-4`, rows `border-t border-ink-200 hover:bg-primary-50`. Columns (by context): Title · Programme · Category · Type · Date · File.
- **Mobile**: stacked rows `flex gap-4 p-4 border-b` with `FileText` icon tile, title, meta line, download icon button.
- **File cell**: link "PDF · 420 KB" with `Download` 16, opens in new tab. File size comes from WordPress attachment metadata — never typed by hand.
- Notices with `is_important` show Badge important; items < 7 days old show Badge new.
- Empty state (§5.19). Pagination: 20 per page, numbered pager.

### 5.15 Notice board (`NoticeBoard`) — homepage
- Card `rounded-xl border border-ink-200 bg-white shadow-sm overflow-hidden h-full flex flex-col`.
- Header: `flex items-center justify-between bg-primary-900 px-6 py-4` · title `font-serif text-lg text-white` with `Bell` 18 gold-400 · "View all" `text-sm text-gold-400`.
- List of latest **6** notices `divide-y divide-ink-200`: row `flex gap-4 px-6 py-4 hover:bg-primary-50`: date tile `w-14 shrink-0 rounded-md border border-ink-200 text-center` (day `text-lg font-bold text-primary-800`, month `text-[11px] uppercase text-ink-500`) · title `text-sm font-medium text-ink-900 line-clamp-2` + badges.
- **Static list. No auto-scroll, no marquee.**

### 5.16 Tabs & Accordion
- Tabs: `role="tablist"`, underline style: `border-b border-ink-200`, tab `px-4 pb-3 text-sm font-semibold text-ink-500 hover:text-ink-900`, active `text-primary-800 border-b-2 border-primary-800 -mb-px`. Arrow-key navigation. Below `md`, tabs scroll horizontally (`overflow-x-auto`), never wrap to 2 lines.
- Accordion: native `<details>/<summary>` styled: `rounded-xl border border-ink-200 bg-white`, summary `flex justify-between px-6 py-5 font-semibold text-ink-900`, `ChevronDown` rotates when open, content `px-6 pb-6 text-ink-700`.

### 5.17 Prose (`.prose-snc`) — WordPress page content
Defined in `@layer components`. Applied to every block of HTML coming from WordPress.
- Max width **`65ch`** (~75 characters per line). Tables, images and figures may break out to the full column width; running text may not.
- `h2` serif `text-2xl md:text-3xl mt-12 mb-4` · `h3` sans bold `text-xl mt-10 mb-3` · `p` `mb-5 leading-7` · `ul/ol` `pl-6 mb-5 space-y-2` with `marker:text-gold-600` · `a` `text-primary-800 underline underline-offset-4` · `img` `rounded-xl my-8` · `figure figcaption` caption style · `blockquote` `border-l-4 border-gold-500 pl-5 italic font-serif text-ink-900` · `table` = DocumentList table look, horizontally scrollable wrapper · `hr` `my-12 border-ink-200`.
- WordPress block classes (`wp-block-*`) must render sensibly: `wp-block-image`, `wp-block-table`, `wp-block-file` (render as DocumentList row look), `wp-block-buttons` (map to Button primary), `wp-block-columns` (grid), `wp-block-gallery` (grid gap-4).
- Internal WP links are rewritten to frontend paths; WP-relative `<img>` are rendered through `next/image` (see plan Phase 4).

### 5.18 Section sidebar (`SectionNav`) — inner pages
- Desktop `lg:col-span-3`, `sticky top-28 self-start`. Card `rounded-xl border border-ink-200 bg-white overflow-hidden`: header `bg-primary-950 px-5 py-4 text-sm font-bold uppercase tracking-wide text-white` (section name), links `block border-l-4 border-transparent px-5 py-3 text-sm text-ink-700 hover:bg-primary-50`, active `border-gold-500 bg-primary-50 font-semibold text-primary-800`, `aria-current="page"`.
- Below sidebar (optional): small "Need help?" InfoCard with admission phone.
- Mobile/tablet (<lg): a `<details>` "In this section" dropdown placed above content, `mb-8`.

### 5.19 Empty state (`EmptyState`)
`rounded-xl border border-dashed border-ink-300 bg-ink-50 px-6 py-14 text-center`: icon 28 `text-ink-500` · `mt-4 font-semibold text-ink-900` (e.g., "No merit lists published for 2026-27 yet") · `mt-1 text-sm text-ink-500` helper ("Lists are published here as soon as the college releases them.").
Used whenever WordPress returns no items. **Never** substitute placeholder/fake records.

### 5.20 Forms (Enquiry / Contact)
- Label `mb-2 block text-sm font-semibold text-ink-900` (+ red `*` for required, with sr-only "required").
- Input/select/textarea `h-11 w-full rounded-md border border-ink-300 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus:border-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-800/20` (textarea `min-h-32 py-3`).
- Error `mt-1.5 text-sm text-danger-700` + `aria-invalid` + `aria-describedby`.
- Layout `grid gap-5 md:grid-cols-2`, message full width. Submit = Button primary `lg`.
- Fields: Full name*, Mobile* (10-digit Indian validation), Email, Programme of interest (B.A. / B.Sc. / Other), Message. Honeypot field. Success message replaces the form (`role="status"`).
- Server action posts to WordPress `snc/v1/enquiry`. On network failure show an honest error ("Could not send. Please call +91 …"), **never a fake success**.

### 5.21 Footer (`SiteFooter`)
- `bg-primary-950 text-white/70 border-t-4 border-gold-500`.
- Top `<Container>` `pt-16 pb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-12`:
  - Col 1 `lg:col-span-4`: emblem 56 + name (serif white) + Hindi name `शिवनारायण चौबीसा महाविद्यालय, सीमलवाड़ा` (`text-sm text-white/60`) · `mt-5 text-sm leading-6` short about (≤45 words, from WP settings) · `mt-6` social icons `size-10 rounded-full border border-white/15 hover:border-gold-400 hover:text-gold-400`.
  - Col 2 `lg:col-span-2`: "Quick Links" (About, Programmes, Admissions, Notices, Gallery, Contact).
  - Col 3 `lg:col-span-3`: "Important Links" (GGTU Banswara, VMOU Kota, Rajasthan Scholarship Portal (SJE), UGC, AISHE, NAD/ABC) — external.
  - Col 4 `lg:col-span-3`: "Contact" — address (MapPin), phones (Phone), email (Mail), "Get directions" link.
  - Column heading: `mb-5 text-sm font-bold uppercase tracking-[0.14em] text-white`. Links `text-sm leading-8 hover:text-gold-400`.
- Bottom bar `border-t border-white/10` `<Container>` `flex flex-col gap-3 py-6 text-xs text-white/50 md:flex-row md:justify-between`: "© {year} Shiv Narayan Choubisa College, Simalwara. All rights reserved." · Privacy Policy · Sitemap.

### 5.22 Floating & sticky actions
- **Mobile (<lg) only:** bottom action bar `fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)]`, each `h-14 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold`: Call (`Phone`) · WhatsApp (WhatsApp mark from `icons/social.tsx`, `text-whatsapp`) · Apply (`text-primary-800`). Add `pb-16` to `<body>` on mobile so the footer isn't hidden.
- **Desktop (≥lg) only:** one WhatsApp button `fixed bottom-6 right-6 size-14 rounded-full bg-whatsapp text-white shadow-md` with tooltip label.
- Nothing else floats. No side tabs, no "back to top" (browser handles it), no chat widgets.

### 5.23 Gallery
- Album grid: cards with cover 4:3, title, photo count, date.
- Album page: `grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4`, tiles `aspect-square rounded-lg object-cover`, click opens lightbox (`yet-another-react-lightbox`) with captions and keyboard navigation.
- Homepage bento: `grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:h-[520px] lg:gap-4`, first tile `md:col-span-2 md:row-span-2`; 5 tiles total; captions on hover only for pointer devices, always visible on touch (small `bg-primary-950/70` label bottom-left).

### 5.24 Stat strip (optional)
Only for **verified** numbers from WP settings (e.g., "Established 2005", "2 UG programmes", "Affiliated to GGTU"). `grid grid-cols-2 lg:grid-cols-4` · value `font-serif text-3xl md:text-4xl text-primary-800` · label `text-sm text-ink-500`. No count-up animation. Hidden if no values configured.

---

## 6. Page templates

ASCII wireframes are structural; spacing/styling come from the components above.

### 6.1 Homepage (`/`)

Order is fixed. Backgrounds alternate as shown.

```
┌─────────────────────────────────────────────────────────────────┐
│ TopBar (lg+)  IQAC · NAAC · Disclosures · Notices · Alumni …  ☎ ✉ f ◎ ▶ │
├─────────────────────────────────────────────────────────────────┤
│ (seal) Shiv Narayan Choubisa College        HOME ABOUT … [APPLY]│  sticky
├─────────────────────────────────────────────────────────────────┤
│ 1. HERO SLIDER (16:6)                                            │
├─────────────────────────────────────────────────────────────────┤
│ 2. QUICK ACCESS  [Admissions] [Merit Lists] [Notices] [Scholarships]  primary-900
├─────────────────────────────────────────────────────────────────┤
│ 3. ABOUT + NOTICE BOARD                               bg-white  │
│   ┌ col-7 ─────────────────────────┐ ┌ col-5 ────────────────┐  │
│   │ — ABOUT SNC                    │ │ ■ Notice Board  View all│ │
│   │ H2 "Vidya Vinayen Shobhate…"   │ │ 09 OCT  Title…    NEW  │  │
│   │ 2 paragraphs                   │ │ 08 OCT  Title…         │  │
│   │ 2×2 facts (icon + text)        │ │ … (6 rows, static)     │  │
│   │ [Read more about SNC →]        │ │                        │  │
│   └────────────────────────────────┘ └────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ 4. PROGRAMMES (center header)                         bg-ink-50 │
│   [ B.A. ProgrammeCard ]  [ B.Sc. ProgrammeCard ]  (2-up, max-w-5xl centred) │
├─────────────────────────────────────────────────────────────────┤
│ 5. WHY CHOOSE SNC (center header) 6 FeatureCards 3×2   bg-white │
├─────────────────────────────────────────────────────────────────┤
│ 6. CTA BAND  "Admissions open for session 2026-27" [Apply] [Call]│
├─────────────────────────────────────────────────────────────────┤
│ 7. LEADERSHIP MESSAGES  2 MessageCards side by side   bg-white  │
├─────────────────────────────────────────────────────────────────┤
│ 8. NEWS & EVENTS (header + "View all")  3 NewsCards   bg-ink-50 │
├─────────────────────────────────────────────────────────────────┤
│ 9. LIFE @ SNC bento (5 photos) + "View gallery"       bg-white  │
├─────────────────────────────────────────────────────────────────┤
│ 10. TESTIMONIALS 3 cards — ONLY if ≥3 real entries    bg-ink-50 │
├─────────────────────────────────────────────────────────────────┤
│ 11. AFFILIATIONS logo strip (GGTU, VMOU) py-10 border-y bg-white │
├─────────────────────────────────────────────────────────────────┤
│ Footer                                                          │
└─────────────────────────────────────────────────────────────────┘
```

Rules: no merit-list filter on the homepage; no stats with unverified numbers; no ticker; no popup. If a CMS-driven section has no data, the whole section is omitted (not an empty state) on the homepage, and the background alternation is recomputed so two same-colour sections never touch (implement alternation by index, not hardcoded).

### 6.2 Section page (default inner template) — e.g. `/about/vision-mission`

```
PageHero (breadcrumb, H1, subtitle)
<section py-16 md:py-20 bg-white>
  Container: grid lg:grid-cols-12 gap-12
    aside lg:col-span-3  → SectionNav (sticky)
    article lg:col-span-9 → .prose-snc content (max-w-3xl) + optional DocumentList / cards
</section>
```

### 6.3 Landing page (section root) — e.g. `/about`, `/academics`, `/admissions`, `/students`, `/campus-life`, `/iqac`
PageHero → intro split (text col-7 + image col-5) → grid of child-page cards (InfoCard with icon, title, 1-line description, link) → optional CTA band. No sidebar.

### 6.4 Programme detail — `/academics/programmes/[slug]`
PageHero (programme name, "Undergraduate · 3 years") → split: overview prose (col-8) + sticky "At a glance" card (col-4: duration, pattern, affiliating university, eligibility, subjects, [Apply Now], [Download syllabus]) → Subjects grid → Career paths list → FAQ accordion (only if WP has FAQs).

### 6.5 Listing pages — `/students/notices`, `/admissions/merit-lists`, `/students/syllabus`, `/students/question-papers`, `/iqac/reports`, `/about/mandatory-disclosures` (documents part)
Section page template; article contains short intro + `DocumentList` with filters.

### 6.6 Faculty — `/academics/faculty`
PageHero → department Tabs (All, Arts, Science, Administration) → PersonCard grid `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

### 6.7 Committees — `/iqac/committees`
Section page; each committee is an Accordion: purpose (1–2 lines), convener, members table (Name · Designation · Role), PDF of order. Session selector for previous years.

### 6.8 News — `/news`, `/news/[slug]`
Listing: category tabs (All · News · Events · Press Notes) + NewsCard grid + pager. Detail: PageHero (title, date, category) → `max-w-3xl` prose + featured image + gallery → "More news" 3 cards.

### 6.9 Gallery — `/campus-life/gallery`, `/campus-life/gallery/[slug]`
See §5.23. Videos page: YouTube embeds lazy-loaded (`lite-youtube` pattern: thumbnail + play button, iframe only after click).

### 6.10 Contact — `/contact`
PageHero → 3 InfoCards (Address, Phone, Email) → split: enquiry form (col-7) + Google Map embed (col-5, `rounded-xl aspect-[4/3]`, lazy, title attr) → office hours (from WP settings).

### 6.11 404 / error
Centered on white: serif "Page not found", one sentence, buttons Home + Contact, plus 4 popular links. Same chrome (header/footer).

---

## 7. Information architecture

### 7.1 Sitemap and routes

Built from the old SNC menu, regrouped with Madhav's top-level logic and GMGC's admissions/governance patterns. **Bold** = top-level nav. Source column = where content comes from in WordPress.

| Route | Page | Source |
|-------|------|--------|
| `/` | Home | `snc/v1/home` |
| **`/about`** | About SNC (landing) | WP Page `about` |
| `/about/pragati-sansthan` | Pragati Sansthan (parent trust, est. 17 March 2004) | WP Page |
| `/about/messages` | Chairman's & Principal's messages | CPT `leader` |
| `/about/vision-mission` | Vision, Mission, Core Values, Ladder of Success, Philosophy | WP Page |
| `/about/affiliations` | Affiliations & recognitions (GGTU Banswara; VMOU Kota study centre) | WP Page |
| `/about/infrastructure` | Infrastructure (library, labs, computer lab, Wi-Fi, classrooms, sports) | WP Page |
| `/about/mandatory-disclosures` | Mandatory disclosures | WP Page + documents (`disclosure`) |
| **`/academics`** | Academics (landing) | WP Page |
| `/academics/programmes` | All programmes | CPT `programs` |
| `/academics/programmes/[slug]` | Programme detail (B.A., B.Sc.) | CPT `programs` |
| `/academics/faculty` | Faculty & staff | CPT `faculty_staff` |
| `/academics/academic-calendar` | Academic calendar | WP Page + documents (`calendar`) |
| `/academics/examinations` | Examination section (GGTU links, schedules, results links) | WP Page + notices (`examination`) |
| **`/admissions`** | Admissions (landing: process steps, key dates, documents required) | WP Page |
| `/admissions/apply` | How to apply / admission form | WP Page (+ external form link from settings) |
| `/admissions/merit-lists` | Merit, waiting & admitted lists by session | CPT `merit_lists` |
| `/admissions/scholarships` | Scholarships (Post-matric SC/ST/OBC/SBC, Minority, TAD girl incentive, Balika Protsahan…) | WP Page |
| `/admissions/admission-kit` | Admission kit & dress code | WP Page |
| `/admissions/fee-structure` | Fee structure — **only if the college provides an official document** | documents (`fee`) |
| **`/students`** | Student Corner (landing) | WP Page |
| `/students/notices` | Notices & circulars | CPT `circulars` |
| `/students/syllabus` | Syllabus | documents (`syllabus`) |
| `/students/question-papers` | Previous year question papers | documents (`question-paper`) |
| `/students/migration` | Migration certificate & nodal officer | WP Page |
| `/students/grievance-redressal` | Student grievance redressal cell | WP Page + committee |
| `/students/anti-ragging` | Anti-ragging committee & undertaking | WP Page + committee + documents |
| `/students/downloads` | Forms & downloads | documents (`form`) |
| **`/campus-life`** | Campus Life (landing: NSS, sports, cultural) | WP Page |
| `/campus-life/placement-cell` | Placement & skill development cell | WP Page |
| `/campus-life/support-guidance` | Support & guidance | WP Page |
| `/campus-life/gallery` · `/[slug]` | Photo gallery | CPT `gallery` |
| `/campus-life/videos` | Video gallery | WP Page (YouTube URLs) |
| `/campus-life/alumni` | Alumni (+ registration form link) | WP Page |
| **`/iqac`** | IQAC (landing) | WP Page |
| `/iqac/naac` | NAAC | WP Page + documents (`naac`) |
| `/iqac/committees` | College committees (session-wise) | CPT `committees` |
| `/iqac/ugc-compliance` | UGC / statutory compliance | WP Page + documents (`compliance`) |
| `/iqac/reports` | AQAR, AISHE, annual reports | documents (`aqar`, `aishe`, `annual-report`) |
| `/news` · `/news/[slug]` | News, events, press notes | WP Posts |
| **`/contact`** | Contact | settings |
| `/privacy-policy` | Privacy policy | WP Page |

### 7.2 Primary navigation (desktop, max 7 items + Apply)

```
HOME · ABOUT · ACADEMICS · ADMISSIONS · STUDENTS · CAMPUS LIFE · IQAC      [APPLY NOW]
```
"Contact" lives in the utility bar, footer and mobile drawer (Madhav does the same). If the client insists on "Contact" in the main nav, it replaces "Home" (the logo already links home).

Mega menu contents:

| Menu | Links (in order) | Image panel tagline |
|------|------------------|--------------------|
| About | About SNC · Pragati Sansthan · Messages · Vision & Mission · Affiliations · Infrastructure · Mandatory Disclosures · Contact | "Estd. 2005 · Simalwara" |
| Academics | **Programmes:** B.A. · B.Sc. · All Programmes — **Resources:** Faculty & Staff · Academic Calendar · Examinations · Syllabus · Question Papers | "Arts & Science" |
| Admissions | Admission Process · How to Apply · Merit Lists · Scholarships · Admission Kit & Dress Code · (Fee Structure if published) | "Session 2026-27" + Apply link |
| Students | Notices · Syllabus · Question Papers · Downloads · Migration · Grievance Redressal · Anti-Ragging | "Student Corner" |
| Campus Life | Activities (NSS, Sports, Cultural) · Placement Cell · Support & Guidance · Photo Gallery · Videos · Alumni · News & Events | "Life @ SNC" |
| IQAC | About IQAC · NAAC · Committees · UGC Compliance · Reports (AQAR / AISHE) | "Quality Assurance" |

Navigation is defined once in `frontend/config/navigation.ts` and used by header, mobile nav, footer, section sidebars and breadcrumbs.

### 7.3 Old URL redirects (301)
Every old snccollegedpr.in URL must permanently redirect to its new route (configured in `next.config.ts` `redirects()`):

| Old | New |
|-----|-----|
| `/about/` | `/about` |
| `/message/` | `/about/messages` |
| `/infrastructure/` | `/about/infrastructure` |
| `/college-committee/` | `/iqac/committees` |
| `/affiliations/` | `/about/affiliations` |
| `/vision-mission/`, `/ladder-of-success/`, `/philosophy/` | `/about/vision-mission` |
| `/activities/` | `/campus-life` |
| `/support-guidance/` | `/campus-life/support-guidance` |
| `/naac/` | `/iqac/naac` |
| `/iqac/` | `/iqac` |
| `/placement-cell/` | `/campus-life/placement-cell` |
| `/student-grievance-redressal-cell/` | `/students/grievance-redressal` |
| `/anti-ragging-committee-undertaking/` | `/students/anti-ragging` |
| `/mandatory-disclosures/` | `/about/mandatory-disclosures` |
| `/faculty-staff-details/` | `/academics/faculty` |
| `/examination-section/` | `/academics/examinations` |
| `/academic-calendar/` | `/academics/academic-calendar` |
| `/ugc-statutory-bodies-compliance-ugc-aicte-approval-docs/` | `/iqac/ugc-compliance` |
| `/courses/` | `/academics/programmes` |
| `/scholarship/` | `/admissions/scholarships` |
| `/student-corner/` | `/students` |
| `/admission/` | `/admissions` |
| `/admission-form/` | `/admissions/apply` |
| `/syllabus/` | `/students/syllabus` |
| `/old-question-papers/` | `/students/question-papers` |
| `/migration-nodal/` | `/students/migration` |
| `/photo-gallery/` | `/campus-life/gallery` |
| `/video-gallery/` | `/campus-life/videos` |
| `/press-note/` | `/news?category=press-notes` |
| `/alumini/` | `/campus-life/alumni` |
| `/contacts/` | `/contact` |
| `/wp-content/uploads/:path*` | WordPress media host (keep old PDF links working) |

---

## 8. Content rules

### 8.1 Voice
Formal, clear, institutional English. Short sentences. No marketing hype ("state-of-the-art", "world-class", "elite", "unparalleled" are banned). Hindi used for the college's Hindi name and where the college supplies Hindi notices.

### 8.2 Truthfulness (hard rule)
- Every number, accreditation, programme, fee, phone number and name shown on the site must come from WordPress, entered by the college or copied from the old site with the source noted.
- No fallback/demo data in production code. Development-only sample content goes into WordPress via the seed script and is clearly labelled `[SAMPLE]` in its title.
- No testimonials, alumni stories, or photos that are not SNC's own.

### 8.3 Verified facts (from snccollegedpr.in, 2026-10-09)

| Fact | Value | Status |
|------|-------|--------|
| Name | Shiv Narayan Choubisa College, Simalwara (SNC College); Hindi: शिवनारायण चौबीसा महाविद्यालय, सीमलवाड़ा | Verified |
| Established | 2005, by Pragati Sansthan | Verified |
| Parent trust | Pragati Sansthan, Dungarpur, est. 17 March 2004, founded by Mr. Prashant Choubisa (President) | Verified (spelling "Prashant" confirmed by owner 2026-10-10) |
| Motto (emblem) | "तमसो मा ज्योतिर्गमय" ("Lead me from darkness to light") | Confirmed by the owner 2026-10-10. The older seal's "Vidya Vinayen Shobhate" is superseded — do not use it. |
| Affiliation | Govind Guru Tribal University (GGTU), Banswara | Verified |
| Distance education | VMOU Kota — Distance Education Centre | Verified |
| UG programmes | B.A. (Hindi Literature, Sanskrit, History, Political Science, Sociology, Economics, Geography) — 3 yrs, semester pattern; B.Sc. (Chemistry–Botany–Zoology) — 3 yrs, semester pattern | Verified (Courses page) |
| Other programmes | None active. B.A. and B.Sc. are the only active degree programmes (confirmed by owner 2026-10-10). | Verified (no other programmes offered) |
| Address | Merop Road, Near Tehsil, M. Dhambola, Simalwara, Dungarpur, Rajasthan – 314403 | Verified (Contacts page) |
| Phones | +91 99830 05899, +91 94143 52319 | Verified (Contacts page). `+91 94144 73665` in current build is **unverified — remove** |
| Email | sncdpr@gmail.com | Verified |
| Social | facebook.com/SNCsimalwara · WhatsApp +91 94143 52319 · YouTube @pragatiandsnccollege · Instagram @pragatigroups | Verify Instagram/YouTube handles with college |
| Sister institution | Pragati College, Dungarpur (2006) | Verified |
| NAAC | Confirmed accredited by owner 2026-10-10; grade & year to be provided by owner before publishing | Pending grade/year details |
| AISHE code | Omitted entirely (confirmed by owner 2026-10-10) | Verified omitted |
| Labs | Chemistry, Botany, Zoology, Geography, Computer lab; Wi-Fi campus; library | Verified (Disclosures/Infrastructure) |
| Committees named | Cultural & Picnic, Discipline, Scholarship, … | Partially verified |

### 8.4 Content gaps to request from the college (blockers marked ★)
★ Official logo files (SVG/PNG, transparent) · ★ 20+ real campus photos (building, classrooms, labs, library, events, NSS, sports) and hero banners · ★ confirmed programme list · ★ Principal's name and photo · Chairman's photo · faculty list with designations/qualifications/photos · committee lists 2025-26 and 2026-27 · notices archive · merit lists PDFs · syllabus and question-paper PDFs · mandatory disclosure documents · AISHE code and reports · Google Maps location pin · real testimonials (with consent) · admission form link / process for 2026-27 · fee structure (if they want it public).

---

## 9. Banned patterns (reviewers reject on sight)

1. Unlayered CSS resets or any CSS outside `@theme`, `@layer base`, `@layer components`.
2. Inline `style={{…}}` for colour, spacing or typography (allowed only for dynamic values like a background-image URL).
3. Hex colours or Tailwind default palette colours in components (`amber-*`, `slate-*`, `blue-*`, `gray-*` …). Use tokens.
4. Fonts other than the three in §3.2; Google Fonts `<link>` tags.
5. Marquee/ticker, blinking/pulsing badges, rotating/conic borders, count-up numbers, typing effects, confetti.
6. Auto-opening modals/popups (admission, newsletter, celebration). Modals open only from an explicit click.
7. Stock photos; images without `alt`; `<img>` instead of `next/image` (except inside WP prose where a sanitised fallback is used).
8. `rounded-2xl`/`rounded-3xl`/`rounded-[…]`, `shadow-lg`+ on cards, glow/coloured shadows, gradient text, glassmorphism panels.
9. More than one primary action per card; more than one gold-filled button per viewport.
10. Hardcoded content strings for facts (phones, addresses, programme data) inside components — all from WordPress (labels like "Read more" are fine).
11. Fake/demo fallback data in `lib/` or components.
12. Navigation deeper than 2 levels; PDFs linked directly from the main nav.
13. Emoji in UI or content.
14. Section-specific container widths or paddings (always `<Container>` + `<Section>`).
15. Text smaller than 12 px; body text smaller than 14 px; line length over ~80 characters.

---

## 10. Accessibility, SEO, performance

**Accessibility (WCAG 2.2 AA)**
- Colour contrast ≥ 4.5:1 for text (tokens chosen to pass; don't put `ink-500` on `ink-100`).
- Skip link "Skip to main content" as first focusable element. `<main id="main">`.
- One `<h1>` per page; heading levels in order.
- Visible focus on every interactive element (gold outline). Menus, tabs, accordion, slider, lightbox fully keyboard operable.
- `lang="en"` on `<html>`; Hindi fragments wrapped in `<span lang="hi">`.
- Touch targets ≥ 44×44 px.

**SEO**
- `generateMetadata` on every route: title pattern `"{Page} | SNC College, Simalwara"`, description from WP excerpt/Yoast field, canonical URL, Open Graph image (featured image or default campus photo).
- `app/sitemap.ts` and `app/robots.ts`.
- JSON-LD: `CollegeOrUniversity` (name, address, phone, logo, sameAs socials) on home; `BreadcrumbList` on inner pages; `NewsArticle` on news.

**Performance budget** (Lighthouse mobile, production build)
- Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- LCP < 2.5 s, CLS < 0.05. Hero image ≤ 250 KB (WebP/AVIF via next/image).
- Client JS: only header interactivity, slider, tabs/filters, lightbox, form are client components. Everything else is a Server Component.
