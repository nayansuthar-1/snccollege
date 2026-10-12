/**
 * Screenshot and measure a page through the Chrome DevTools Protocol.
 *
 * No npm dependency: it uses Node's global WebSocket (Node 22+) and the Chrome already
 * installed on the machine. Start Chrome once with:
 *
 *   chrome --headless=new --disable-gpu --hide-scrollbars \
 *          --remote-debugging-port=9222 --user-data-dir=/tmp/snc-chrome about:blank &
 *
 * Usage:
 *   node shot.mjs <url> <width> <height> <out.png> [action]
 *
 *   action  omitted            just screenshot
 *           "ACTIVITIES"       click the top-level nav trigger whose label starts with this
 *           "js:<expression>"  evaluate it; a returned string is printed, a Promise awaited
 *
 * Prints a {docW, winW} pair. docW > winW means the page scrolls horizontally.
 * Override the port with CDP_PORT.
 */
import { writeFileSync } from 'node:fs';

const [url, width, height, out, action] = process.argv.slice(2);
if (!url || !width || !height || !out) {
  console.error('usage: node shot.mjs <url> <width> <height> <out.png> [action]');
  process.exit(2);
}

const PORT = process.env.CDP_PORT || '9222';
const SETTLE_MS = Number(process.env.SETTLE_MS || 3500);

let target;
try {
  target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
} catch (err) {
  console.error(`Could not reach Chrome on port ${PORT}. Is it running with --remote-debugging-port=${PORT}?`);
  console.error(String(err));
  process.exit(1);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
});
await new Promise((resolve) => ws.addEventListener('open', resolve));

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) {
    throw new Error(`${result.exceptionDetails.text} ${result.exceptionDetails.exception?.description ?? ''}`);
  }
  return result.result.value;
}

await send('Emulation.setDeviceMetricsOverride', {
  width: Number(width),
  height: Number(height),
  deviceScaleFactor: 1,
  mobile: Number(width) < 768,
});
await send('Page.enable');
await send('Page.navigate', { url });
await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

if (action?.startsWith('js:')) {
  console.log('js:', await evaluate(action.slice(3)));
  await new Promise((resolve) => setTimeout(resolve, 700));
} else if (action) {
  const clicked = await evaluate(`
    (() => {
      const button = [...document.querySelectorAll('nav[aria-label="Main"] button')]
        .find((b) => b.textContent.trim().toUpperCase().startsWith(${JSON.stringify(action.toUpperCase())}));
      if (!button) return 'NOT FOUND';
      button.click();
      return 'clicked';
    })()
  `);
  console.log('trigger:', clicked);
  if (clicked === 'NOT FOUND') process.exitCode = 1;
  await new Promise((resolve) => setTimeout(resolve, 600));
}

const overflow = await evaluate(
  'JSON.stringify({ docW: document.documentElement.scrollWidth, winW: window.innerWidth })',
);
console.log('overflow check:', overflow);

const { data } = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(data, 'base64'));
console.log('wrote', out);

ws.close();
process.exit(process.exitCode ?? 0);
