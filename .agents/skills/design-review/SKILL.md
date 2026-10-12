---
name: design-review
description: Audit UI work against the SNC design system before declaring it done — tokens, container discipline, spacing rhythm, type scale, the banned-pattern list, accessibility and truthfulness. Use at the end of any task that adds or changes a component, page or section in frontend/.
---

# Design review

Run this before you say a UI task is finished. It is the difference between a page that
follows a system and a page that merely looks plausible in isolation.

Work through it in order. Any **FAIL** means the task is not done, however good the page
looks. Record the result in the `docs/PROGRESS.md` entry.

## 1. Automated checks first

From `frontend/`, the eight greps in `docs/02-IMPLEMENTATION-PLAN.md` Part C. Every one must
print nothing, with two documented exceptions: `shadow-xl` in `MegaMenu.tsx`, and
`motion-safe:animate-spin` in `EnquiryForm.tsx`.

Then `npm run lint`, `npx tsc --noEmit`, `npm run build`. Zero errors, and zero warnings you
introduced. (`postcss.config.mjs` has one pre-existing warning.)

These catch the mechanical violations. They do not catch the next six sections.

## 2. Alignment — the rule that makes or breaks the page

Open the page at 1280 px and look down its left edge. The logo, every heading, every card
and every footer column must sit on **one vertical line**. If anything is inset differently,
a section has defined its own width or padding instead of using `<Section>` + `<Container>`.

This single defect is what made the previous build look amateurish. Check it first and check
it visually, not by reading classes.

## 3. Rhythm

- Every full section: `py-16 md:py-24`. Not `py-12`, not `py-20`.
- Section header to content: `mb-10 md:mb-14`.
- Card grid gaps: `gap-6 lg:gap-8`. Card padding: `p-6 md:p-8`.
- Backgrounds alternate white / `ink-50` **by position**. Two sections of the same tone must
  never touch; a dark band resets the alternation. On the homepage this is computed in
  `app/page.tsx` — never hardcode a tone.

Generous whitespace is a requirement here, not a preference. A cramped section fails.

## 4. Colour

- Tokens only. Nothing from Tailwind's default palette (it is deleted and produces nothing).
- Navy and gold on neutrals. No third brand colour, no gradients except the two photo
  overlays in §3.8.
- **At most one gold-filled element in the viewport.** Count them.
- No gold text on white — it fails AA. Use `primary-800`.
- On dark: white headings, `text-white/80` body, `gold-400` eyebrows and links.

## 5. Type

- Exactly the combinations in §3.2. If you invented a size, it is wrong.
- Running text ≤ `65ch`. A paragraph spanning a 1440 px container is unreadable.
- Body text never below 14 px, nothing below 12 px.
- No all-caps phrase longer than four words.
- Headings in order, one `<h1>` per page.
- Devanagari is never italic.

## 6. Looks deliberate, not generated

The target is a serious Indian college site, not a startup landing page. Ask:

- Is every element here doing a job? Decoration that carries no information is noise.
- Does this section reuse an existing component, or is it a one-off that now needs
  maintaining? Prefer the existing card, badge, tabs and empty state.
- Is the hierarchy obvious at a glance — one clear heading, one clear primary action?
- Would this still read well with the college's real content, which is sparse and in plain
  institutional English, rather than the polished placeholder text in front of you?
- Is there exactly one way to do this thing across the site, and does this match it?

## 7. Responsive and keyboard

Use the `visual-verification` skill at 360, 768, 1280 and 1440 px. For each:

- No horizontal scroll (`scrollWidth` ≤ viewport).
- Nothing overlaps or is clipped.
- Touch targets ≥ 44 × 44 px.
- Tab through: focus always visible, order sensible, menus and dialogs operable and
  escapable, focus returned to the trigger on close.

## 8. Truthfulness

The last gate, and the one with real consequences. Every number, name, date, phone number,
programme and claim on the page must come from WordPress. No invented facts, no stock
photos, no fallback sample data, and empty states instead of placeholder rows. See the
`never-invent-content` rule.

## Reporting

In `docs/PROGRESS.md`: the Part C output (empty), the widths checked, the screenshots saved,
and any deviation from the design system with a written reason. A deviation that is not
recorded is a defect.
