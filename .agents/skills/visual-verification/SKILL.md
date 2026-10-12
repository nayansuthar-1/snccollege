---
name: visual-verification
description: Look at a page in a real browser before calling UI work done — screenshot it at 360/768/1280/1440 px, detect horizontal overflow, open menus and drawers, and measure element geometry. Use after any change to a component, page or stylesheet in frontend/, and whenever a layout question needs an answer rather than a guess.
---

# Visual verification

Design system §A3 requires every page touched in a phase to be checked at **360, 768, 1280
and 1440 px**. "It should be fine" is not a check. Most of the layout bugs found in this
project — a nav overlapping the brand, a drawer clipped to 64 px, a 745 KB favicon — were
invisible in the code and obvious in a screenshot.

No Playwright or Puppeteer is installed, and adding one needs the owner's approval
(plan rule A2.7). Use Chrome's DevTools Protocol directly through the bundled script, which
needs nothing but Node and the Chrome already on the machine.

## Setup

Start the dev server if it is not already running (check `http://localhost:3000` first — a
second `next dev` will refuse to start and the error is easy to misread):

```bash
cd frontend && npm run dev
```

Start headless Chrome once per session, then leave it running:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --hide-scrollbars --remote-debugging-port=9222 \
  --user-data-dir=/tmp/snc-chrome about:blank &
```

Confirm it is up: `curl -s http://127.0.0.1:9222/json/version`.

## Taking a shot

```bash
node .agents/skills/visual-verification/scripts/shot.mjs <url> <width> <height> <out.png> [action]
```

Then **open the PNG and actually look at it.** The script prints a `docW` / `winW` pair; if
`docW` exceeds `winW` the page scrolls horizontally, which fails §A3. (With scrollbars hidden
`docW` is normally `winW` minus about 15 px — that is fine.)

The four required widths:

```bash
for w in 360 768 1280 1440; do
  node .agents/skills/visual-verification/scripts/shot.mjs http://localhost:3000/ $w 900 /tmp/home-$w.png
done
```

## Driving the page

The optional fifth argument runs before the screenshot.

Plain text clicks a top-level nav trigger by label:

```bash
node .../shot.mjs http://localhost:3000/ 1280 700 /tmp/mega.png "ACTIVITIES"
```

A `js:` prefix evaluates an expression — return a string to have it printed, or a Promise to
wait. Open the mobile drawer:

```bash
node .../shot.mjs http://localhost:3000/ 360 780 /tmp/drawer.png \
  'js:(()=>{document.querySelector("[aria-label=\"Open menu\"]").click();return "opened"})()'
```

Scroll to a section (scroll twice with a pause — images loading above shift the layout):

```bash
node .../shot.mjs http://localhost:3000/ 1280 900 /tmp/section.png \
  'js:(()=>{const f=()=>[...document.querySelectorAll("h2")].find(e=>/Notice Board/.test(e.textContent)).closest("section");
   f().scrollIntoView();return new Promise(r=>setTimeout(()=>{f().scrollIntoView();setTimeout(()=>r("ok"),400)},900))})()'
```

## Measuring instead of guessing

The same hook answers layout questions numerically, which beats eyeballing a screenshot when
you need to know *how much* something overflows:

```bash
node .../shot.mjs http://localhost:3000/ 1280 200 /tmp/x.png \
  'js:JSON.stringify({nav:document.querySelector("nav[aria-label=\"Main\"]").getBoundingClientRect(),
                      brand:document.querySelector("header a").getBoundingClientRect()})'
```

Useful checks: `getComputedStyle(el).position`, element `getBoundingClientRect()`, and
`document.documentElement.scrollWidth`.

**One trap worth knowing:** an ancestor with `backdrop-filter` (our sticky header has
`backdrop-blur`) becomes the containing block for `position: fixed` descendants. Anything
`fixed` rendered inside the header must be portalled to `<body>`. If a fixed overlay measures
the height of the header rather than the viewport, this is why.

## Keyboard and accessibility

A screenshot does not prove the page is usable. Also confirm, per §A3 and §10:

- Tab through the page: focus is always visible (gold outline) and the order is sensible.
- Menus open with Enter/Space and ArrowDown, close with Escape, and return focus to the trigger.
- The drawer traps focus and locks body scroll.
- One `<h1>`, headings in order, every image has `alt`.

## Where screenshots belong

Save the ones worth keeping to `docs/screenshots/phase-<N>/<page>-<width>.png` and list them
in the `docs/PROGRESS.md` entry. Keep at least 1280 and 360 for each page you changed.

## Cleaning up

```bash
pkill -f "remote-debugging-port=9222"
```
