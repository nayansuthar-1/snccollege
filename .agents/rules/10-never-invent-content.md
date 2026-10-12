---
trigger: always_on
description: The single hard rule of this project — no fact about the college may be invented, guessed, or written into code. Everything factual comes from WordPress.
---

# Never invent content

This is a real college website. A wrong number here is not a cosmetic bug: it misleads
students about admissions, fees and accreditation. The previous build was thrown away
largely because it shipped fabricated facts (see `docs/01-DESIGN-SYSTEM.md` §1 and §8.2).

## Forbidden, always

- Fees, seat counts, intake numbers, pass percentages, placement figures, salary figures.
- Accreditation claims. **The college is not NAAC accredited** as far as anyone here knows.
  Never write "NAAC accredited" or an assessment grade.
- An AISHE code. `C-39947` belongs to a different college and must never reappear.
- Programmes beyond **B.A.** and **B.Sc.** M.A., B.Com, BCA, PGDCA and M.Sc. appear
  inconsistently on the old site and are unconfirmed.
- Testimonials, reviews, star ratings, review counts, alumni stories.
- Phone numbers, email addresses or addresses not already in WordPress settings.
- Staff names, designations or qualifications.
- Dates, deadlines or session labels.
- Stock photography of any kind, and any photo presented as the college's own.

## Where facts are allowed to come from

1. **WordPress** — the `snc/v1` API, via `lib/wp/api.ts`. This is the only source.
2. **`docs/01-DESIGN-SYSTEM.md` §8.3**, the verified-facts table, for things that belong in
   code rather than the CMS (the college's name, for example). Rows marked "confirm" are
   **not** verified and may not be published.

Non-factual UI strings — "Read more", "View all", "No notices published yet" — are fine in
code. The test is: could a visitor act on this as information about the college? If yes, it
comes from WordPress.

## What to do when data is missing

- A list with no items renders `<EmptyState>`. Never a placeholder row.
- A homepage section with no data is **omitted entirely** from the page.
- A missing page calls `notFound()`.
- An image that does not exist yet uses `<ImagePlaceholder>`, never a stock photo.
- A fetch failure renders the empty state. **Never a fallback object with sample values.**

## Sample data

Test records live in WordPress only, created by `seed/seed.php --samples`, and every title
starts with `[SAMPLE]`. Never add sample data to `lib/`, `config/` or a component, and never
remove the `[SAMPLE]` prefix from seeded records to make a screenshot look better.

## If you need a fact you do not have

Stop. Write the question in `docs/PROGRESS.md` under "Open questions", addressed to the
owner, and build the rest of the task around the gap. Do not pick a plausible value.
