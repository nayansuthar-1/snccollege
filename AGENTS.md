# Agent instructions — SNC College website

Before doing ANY work in this repository, read both documents in full:

1. `docs/01-DESIGN-SYSTEM.md` — how the site must look and behave (binding).
2. `docs/02-IMPLEMENTATION-PLAN.md` — what to build, in which phase order, and the acceptance criteria (binding).

Then read `docs/PROGRESS.md` (if it exists) to find the current phase. Work only on that phase.
Follow "Part A — Rules for the implementing agent" in the implementation plan exactly.

Phases 0–10 of the implementation plan are **done**. The remaining work is planned as
phases A–I in `antigravity.md` at the repository root — read it before starting, and work
one phase at a time from there.

`BLOCKERS.md` at the repository root is the checkbox register of everything waiting on the
college, the owner or a real device. Check it before concluding that a phase can be started:
most of the remaining phases are blocked there, not on code.

The hard rule, above all others: **never invent a fact about the college.** Fees, grades,
accreditation, phone numbers, staff names, reviews and statistics come from WordPress or
they do not appear. See `.agents/rules/10-never-invent-content.md`.

Two deliberate departures from the design system, already agreed with the owner and
explained in `docs/PROGRESS.md` — do not "fix" them:
- Navigation follows the college's own menu, not design system §7.2.
- The mobile drawer is portalled to `<body>`, because the header's `backdrop-blur` would
  otherwise clip it.
