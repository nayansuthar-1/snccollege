# BLOCKERS — what the website is waiting for

**Last checked:** 12 October 2026

Everything below is work that **cannot be done by the development team**. It needs a fact, a
file, a photograph or a decision from someone else. The engineering is finished and verified;
these items are what stand between the current build and launch.

The college-facing version of the content list, written in plain language for the office, is
`docs/COLLEGE-CONTENT-REQUEST.md`. This file is the internal tracker — tick items here as
they arrive.

**The rule that governs all of it:** nothing on this list may be filled in with a plausible
guess. A missing fact leaves an empty space on the website, which is correct and safe. An
invented fact is published as if the college had said it. See
`.agents/rules/10-never-invent-content.md`.

---

## P1 — Blocks launch

### A. College office

- [ ] **Office working hours** — e.g. "Monday to Saturday, 10:00 am – 4:00 pm". The settings
      field is empty, so the contact page shows no hours at all.
- [ ] **Current admission session label** — e.g. `2026-27`. Empty.
- [ ] **Is admission currently open?** The "Admissions Open" badge in the site header is
      currently **off** because nobody has confirmed it.
- [ ] **Online application link** — the college form, the GGTU portal or the Rajasthan SSO
      link. Empty, so the Apply Now button falls back to the "How to Apply" page.
- [ ] **Google Maps location** — both the "Share → Copy link" URL and the "Share → Embed a
      map" URL. Both empty, so the contact page shows no map.
- [ ] **5–10 recent notices as PDFs**, each with its exact date and subject.
- [ ] **Committee orders with member lists** — Anti-Ragging Committee and Squad (with
      convener contact numbers), Student Grievance Redressal Cell, Internal Complaints
      Committee (ICC / Women Cell). The 11 committees exist on the site by name only; no
      member is listed because no order has been supplied.
- [ ] **Which session each committee belongs to** (e.g. 2026-27). None of the 11 is tagged
      with a session today, which is why the page currently lists all of them. The committees
      page shows **one session at a time**, so the moment one committee is tagged the other
      ten vanish from the website — they must all be tagged together. Flagged for the owner
      as a design question in `docs/PROGRESS.md`.

### B. Principal and management

- [ ] **Principal's full name**, qualifications and photograph. The leadership message is
      currently published under the title "The Principal" because the name is not known.
- [ ] **Principal's message text** (150–300 words).
- [ ] **Chairman's photograph.** The message text is already published.
- [ ] **NAAC grade and year of accreditation.** Accreditation itself was confirmed by the
      owner on 2026-10-10, but with no grade or year nothing about NAAC appears anywhere on
      the site. *(Note for the developer: `.agents/rules/10-never-invent-content.md` still
      states the college is not accredited and now contradicts design system §8.3. The owner,
      not an agent, should settle which is right.)*
- [ ] **Staff directory** — full name, designation, department, highest qualification and
      years of experience for every teaching and non-teaching member, plus a passport-style
      photograph for each. The faculty page is empty until this arrives.
- [ ] **GGTU affiliation letter number** or written confirmation.

### C. Media / IT coordinator

- [ ] **Confirm the Instagram and YouTube accounts are the college's own.** The site currently
      links `instagram.com/pragatigroups` and `youtube.com/@pragatiandsnccollege`, both
      inherited from the old website and both apparently belonging to the parent trust rather
      than the college. Facebook (`/SNCsimalwara`) is verified. If these are wrong they are
      publicly wrong today.
- [ ] **3–5 homepage banner photographs**, 1920 × 720 landscape (and 1080 × 1350 upright
      versions if available): main gate or front building, campus view, a classroom or
      laboratory in use, library, an event or NSS camp. Until these arrive the homepage shows
      the college name and emblem instead of a slider — which works correctly, but is plain.
- [ ] **The "About SNC" homepage photograph.**
- [ ] **The admission banner background photograph.**
- [ ] **Exactly five photographs for the "Life @ SNC" homepage grid.** The section stays
      hidden below five.
- [ ] **A transparent SVG of the college emblem.** The bundled 638 px PNG is slightly soft at
      the size the homepage uses it.
- [ ] **A default sharing image**, 1200 × 630. Until it is set, pages shared on WhatsApp or
      Facebook carry no picture.

> **Stock photography is banned outright**, including as a temporary stand-in. A photograph
> presented as the college's own when it is not is the same error as an invented fact.

---

## P2 — Needed shortly after launch

- [ ] Recent merit lists and waiting lists as PDFs (B.A. and B.Sc., by category).
- [ ] Academic calendar 2026–27 (PDF).
- [ ] GGTU syllabus copies for B.A. and B.Sc. (PDFs).
- [ ] Previous years' university question papers.
- [ ] Names of the scholarship schemes the college accepts.
- [ ] Faculty portrait photographs, if not supplied with the staff directory above.
- [ ] Photographs for the mega-menu panels and page hero backgrounds.

## P3 — Nice to have

- [ ] Blank student forms — transfer certificate, character certificate, bonafide
      certificate, railway concession.
- [ ] 5–10 photographs each for recent events (sports week, NSS camp, cultural day, science
      exhibition).

---

## Google reviews

The homepage reviews section is built and working, and stays hidden until real data arrives.
It currently holds four `[SAMPLE]` placeholders that exist only for local testing.

- [ ] The **star rating** and **total review count** from the college's Google Business
      profile.
- [ ] The **link to the Google listing**.
- [ ] **3–4 reviews**, each with the reviewer's name exactly as Google shows it, the full text
      unedited, the star rating, the date and the permalink to that review.
- [ ] **Owner decision:** enter reviews by hand (as built), or pull them from the Google
      Places API? The API needs a billed Google Cloud key, returns at most five reviews, and
      requires Google attribution plus a link to the original. Adding that dependency needs
      the owner's approval.

**No review, score or review count may ever be written into the code, the seed or the
settings as a placeholder.**

---

## Owner decisions

- [x] ~~**Should the development team initialise git and commit each phase?**~~ **Done
      2026-10-12** — pushed to `https://github.com/nayansuthar-1/snccollege.git`. Note that the
      repository is **not a backup**: it excludes WordPress core, `wp-config.php` and
      `wp-content/uploads/`, so a restore also needs a database dump and the uploads folder.
- [ ] **Hosting for the website** (Next.js) — provider and account.
- [ ] **Hosting for the CMS** (WordPress). The plan assumes `cms.snccollegedpr.in` unless the
      owner says otherwise.
- [ ] **DNS access** for `snccollegedpr.in`, to point the domain at the new hosting.
- [ ] **wp-admin login for the development team**, so the staff guide can be finished with
      real screenshots of each screen. The guide text is complete and verified against the
      code, but has no pictures.
- [ ] **Contact details for the runbook** — the development team, both hosting providers, the
      domain registrar, and the college staff member responsible for the website. These are
      deliberately blank in `docs/OPERATIONS-RUNBOOK.md` §11; a wrong number there sends
      someone to the wrong place during an outage.
- [ ] **Name the staff member to be trained** on the CMS, and arrange a time.
- [ ] **Final sign-off** that the site is ready to go live.

---

## Needs a real device — cannot be done headlessly

Everything here was verified in headless Chrome at 360 / 768 / 1280 / 1440 px with zero
overflow, zero console errors and a clean accessibility pass. These remain:

- [ ] Chrome, Firefox, Safari on iOS and Samsung Internet on Android.
- [ ] On a real iPhone: the mobile action bar, `env(safe-area-inset-bottom)`, and that the
      footer is not hidden behind the bar.
- [ ] The mobile drawer on a real device — focus trap, scroll lock, and that it is not
      clipped. *(It is portalled to `<body>` on purpose. Do not "fix" that.)*
- [ ] Devanagari rendering on Windows, Android and iOS. It uses system font fallbacks, so it
      genuinely looks different on each.
- [ ] Forms on mobile keyboards, and `tel:` and WhatsApp links on a real phone.

---

## Must be verified on production, not locally

- [ ] All 34 legacy redirects from design system §7.3. *(Verified locally on 2026-10-12:
      every one redirects with and without a trailing slash, and every destination returns
      200. Re-check after DNS.)*
- [ ] `/wp-content/uploads/:path*` still resolves, so PDF links printed on paper and shared
      on WhatsApp keep working. *(Verified locally 2026-10-12.)*
- [ ] End-to-end revalidation: edit in wp-admin, confirm the change appears on the live site.
      *(Verified locally 2026-10-12, including that `/api/revalidate` returns 401 without the
      secret, 401 with a wrong one, and 405 on GET.)*
- [ ] The CMS serves `X-Robots-Tag: noindex`. *(Verified locally 2026-10-12; the WordPress
      front end also redirects to the site, and `/wp/v2/users` and the custom post types both
      return 404.)*
- [ ] `autologin.php`, `auto-login-link.txt` and `setup_wp.php` absent from the server.
      *(Absent from the repository as of 2026-10-12.)*
- [ ] Database and uploads backups scheduled, **and a restore actually tested**.
- [ ] Lighthouse re-run on production with real content. The known miss is LCP at 2.9–3.1 s
      against a 2.5 s budget, measured locally with no CDN; measure again on real hosting
      before changing anything.
- [ ] Sitemap submitted to Google Search Console.

---

## Already settled — do not re-ask

| Question | Answer | When |
|---|---|---|
| Founder's name spelling | **Prashant Choubisa** (one `s`) | 2026-10-10 |
| AISHE code | **Omitted entirely** from the site | 2026-10-10 |
| Programmes offered | **B.A. and B.Sc. only.** M.A., B.Com, BCA and M.Sc. on legacy pages are inactive | 2026-10-10 |
| College motto | **तमसो मा ज्योतिर्गमय.** "Vidya Vinayen Shobhate" is superseded | 2026-10-10 |
| Header button | Stays **Apply Now**; Contact Us stays the 8th nav item | 2026-10-10 |
| `/academics` | Left unlinked; Courses points at `/academics/programmes` | 2026-10-10 |
| `/news` breadcrumbs | Stay under the Gallery menu | 2026-10-10 |
| Contact details, address, WhatsApp, Facebook | Verified and live | 2026-10-09 |
