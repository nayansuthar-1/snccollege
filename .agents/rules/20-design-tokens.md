---
trigger: glob
globs: frontend/**/*.tsx,frontend/**/*.ts,frontend/**/*.css
description: Styling rules for the SNC frontend — design tokens, spacing, the container, and the patterns that are rejected on sight.
---

# Styling rules

`docs/01-DESIGN-SYSTEM.md` is binding and wins over anything you would otherwise prefer.
§3 has the tokens, §4 the layout, §5 the components with exact class strings, §9 the ban
list. Read the relevant section before writing classes; do not reconstruct it from memory.

## The four rules that are broken most often

1. **Only tokens.** `primary-*`, `gold-*`, `ink-*`, `danger-700`, `success-700`, `whatsapp`,
   `google-*`. Tailwind's default palette is deleted in `globals.css` (`--color-*: initial`),
   so `bg-gray-100` or `text-blue-600` silently produce **nothing**. No hex in components.
2. **Never a bespoke container.** Every section is `<Section>` + `<Container>`. A section that
   sets its own `max-w-*` or horizontal padding breaks the vertical alignment that makes the
   whole site look deliberate. This is the single most important layout rule.
3. **Section padding is `py-16 md:py-24`**, always, via `<Section>`. Spacing uses only the
   steps 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24. No `mt-[13px]`.
4. **Gold is an accent.** At most one gold-filled element per viewport — normally "Apply Now".
   Gold text on white fails contrast; use `primary-800`.

## Banned, rejected on sight (§9)

`rounded-2xl` · `rounded-3xl` · `rounded-[…]` · `shadow-lg` and heavier on cards · coloured
or glow shadows · gradient text · glassmorphism · `backdrop-blur` outside the sticky header ·
inline `style={{}}` for colour, spacing or type · marquee, ticker, blink, pulse, ping, bounce,
spin, count-up, typing effects · auto-opening modals · stock photos · `<img>` instead of
`next/image` · emoji · navigation deeper than two levels · body text under 14 px ·
unlayered CSS or anything in `globals.css` outside `@import`, `@theme` and `@layer`.

`shadow-xl` is allowed only in `MegaMenu.tsx`. `animate-spin` is allowed only on the
EnquiryForm submit spinner, wrapped in `motion-safe:`.

## Type

Two families only, both via `next/font`: Merriweather 700 (`font-serif`, headings) and Plus
Jakarta Sans 400–700 (`font-sans`, everything else). Devanagari falls back to system fonts —
**never italicise Devanagari**, the synthesised slant is unreadable. Use the exact type-scale
combinations in §3.2; do not invent sizes. Running text caps at `65ch`.

## Components

A component you need probably exists in `frontend/components/`. Check `/styleguide` (dev only)
before building a new one. One component per file, filename = PascalCase component name.
Server Components by default; `'use client'` only for header interactivity, the slider, tabs,
document filters, the lightbox and the enquiry form.

## Before you call the work done

Run the eight banned-pattern greps in `docs/02-IMPLEMENTATION-PLAN.md` Part C, then
`npm run lint`, `npx tsc --noEmit` and `npm run build`. All must be clean. Then **look at the
page** at 360, 768, 1280 and 1440 px — use the `visual-verification` skill, do not assume.
