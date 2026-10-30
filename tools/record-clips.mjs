// Records the short silent clips that play on the web products' cards and lead their project windows: each live
// site, scrolled down and back up so the clip loops without a jump. Chrome records the tab itself (H.264 MP4), so
// nothing else needs installing. The clips are written to apps/web/public/projects/<slug>-clip.mp4.
//
//   node tools/record-clips.mjs [slug ...]
//
// Needs Google Chrome (CHROME_PATH overrides the macOS default) and a network connection. Ikitai is an app, so
// its clip has to come from a screen recording of the app itself.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = join(root, 'apps/web/public/projects');
const chromePath =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9342;

// The same pages as the products' captures (docs/ASSETS.md), at the same 1280 × 720 size.
// `dismiss` lists the text of banners to close first, as a visitor would.
const clips = [
  { slug: 'taplog', url: 'https://taplog.jp/', scroll: 760 },
  { slug: 'fairmints', url: 'https://fairmints.io/', scroll: 640 },
  {
    slug: 'festcompass',
    url: 'https://festcompass.jp/festivals',
    scroll: 820,
    dismiss: ['Install FestCompass'],
  },
];
const SECONDS = 7;
const SIZE = { width: 960, height: 540 };
const BITRATE = 650_000;

async function cdp(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else for (const listener of listeners) listener(message);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const messageId = ++id;
      pending.set(messageId, { resolve, reject });
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });
  const once = (method) =>
    new Promise((resolve) => {
      const listener = (message) => {
        if (message.method !== method) return;
        listeners.delete(listener);
        resolve(message);
      };
      listeners.add(listener);
    });
  return { send, once, close: () => ws.close() };
}

// Runs in the product's page before recording: closes banners, then scrolls through once so lazy images load.
const prepare = (distance, dismiss) => `(async () => {
  for (const text of ${JSON.stringify(dismiss)}) {
    for (const element of document.querySelectorAll('body *')) {
      if (!element.textContent.includes(text) || element.children.length > 12) continue;
      let banner = element;
      while (banner.parentElement && getComputedStyle(banner).position !== 'fixed') banner = banner.parentElement;
      if (getComputedStyle(banner).position === 'fixed') banner.remove();
    }
  }
  for (let y = 0; y <= ${distance} + 400; y += 200) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  window.scrollTo(0, 0);
  await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
})()`;

// Runs in the product's page: records the tab while easing down `distance` pixels and back up. While a tab is
// shared Chrome shows a bar above it, so if the page is no longer 1280 × 720 it stops and reports its size.
const record = (distance, seconds, size, bitrate) => `(async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { width: ${size.width}, height: ${size.height}, frameRate: 24 },
    audio: false,
    preferCurrentTab: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (innerWidth !== 1280 || innerHeight !== 720) {
    stream.getTracks().forEach((track) => track.stop());
    return { width: innerWidth, height: innerHeight };
  }
  const type = 'video/mp4;codecs=avc1.42E01F';
  if (!MediaRecorder.isTypeSupported(type)) throw new Error('This Chrome cannot record H.264 MP4');
  const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: ${bitrate} });
  const chunks = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  const stopped = new Promise((resolve) => (recorder.onstop = resolve));
  const distance = Math.min(${distance}, document.documentElement.scrollHeight - innerHeight);
  window.scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 300));
  recorder.start();
  const start = performance.now();
  await new Promise((resolve) => {
    const step = (now) => {
      const t = (now - start) / ${seconds * 1000};
      if (t >= 1) return resolve();
      // A pause at the top, down, a pause at the bottom, back up.
      const phase = Math.min(1, Math.max(0, t < 0.5 ? (t - 0.08) / 0.34 : (0.92 - t) / 0.34));
      window.scrollTo(0, distance * phase * phase * (3 - 2 * phase));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  recorder.stop();
  await stopped;
  stream.getTracks().forEach((track) => track.stop());
  const bytes = new Uint8Array(await new Blob(chunks, { type }).arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { video: btoa(binary) };
})()`;

async function main() {
  const wanted = process.argv.slice(2);
  const selected = wanted.length ? clips.filter((clip) => wanted.includes(clip.slug)) : clips;
  const profileDir = mkdtempSync(join(tmpdir(), 'record-clips-'));
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profileDir}`,
      // Headless Chrome's screen is 800 × 600 unless told otherwise, and windows can't be larger.
      '--screen-info={1920x1200}',
      '--window-size=1280,720',
      '--hide-scrollbars',
      '--mute-audio',
      // Lets the page record its own tab without the sharing prompt.
      '--auto-accept-this-tab-capture',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      await sleep(200);
      target = await fetch(`http://127.0.0.1:${PORT}/json/list`)
        .then((r) => r.json())
        .then((list) => list.find((t) => t.type === 'page'))
        .catch(() => undefined);
    }
    if (!target) throw new Error('Chrome did not start');
    const page = await cdp(target.webSocketDebuggerUrl);
    await page.send('Page.enable');
    const { windowId, bounds } = await page.send('Browser.getWindowForTarget');
    const window = { width: bounds.width, height: bounds.height };
    for (const clip of selected) {
      const loaded = page.once('Page.loadEventFired');
      await page.send('Page.navigate', { url: clip.url });
      await loaded;
      // Let data, images and fonts arrive.
      await sleep(4000);
      await page.send('Runtime.evaluate', {
        expression: prepare(clip.scroll, clip.dismiss ?? []),
        awaitPromise: true,
      });
      await sleep(1000);
      let recorded;
      for (let attempt = 0; attempt < 3 && !recorded?.video; attempt++) {
        if (recorded) {
          // Make the window's page area exactly 1280 × 720 while the tab is shared, like the captures.
          window.width += 1280 - recorded.width;
          window.height += 720 - recorded.height;
          await page.send('Browser.setWindowBounds', { windowId, bounds: window });
          await sleep(500);
        }
        const result = await page.send('Runtime.evaluate', {
          expression: record(clip.scroll, SECONDS, SIZE, BITRATE),
          awaitPromise: true,
          returnByValue: true,
          userGesture: true,
        });
        if (result.exceptionDetails)
          throw new Error(
            `${clip.slug}: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`,
          );
        recorded = result.result.value;
      }
      if (!recorded.video) throw new Error(`${clip.slug}: the page could not be made 1280 × 720`);
      const file = join(outDir, `${clip.slug}-clip.mp4`);
      const video = Buffer.from(recorded.video, 'base64');
      writeFileSync(file, video);
      console.log(`projects/${clip.slug}-clip.mp4  ${Math.round(video.length / 1024)} KB`);
    }
    page.close();
  } finally {
    chrome.kill();
    await sleep(300);
    rmSync(profileDir, { recursive: true, force: true });
  }
}

await main();
