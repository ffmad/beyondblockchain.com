// Records the short silent clips that play on the web products' cards and lead their project windows: each live
// site, scrolled down and back up so the clip loops without a jump. It also records the previews of the projects
// still in progress, each moving in its own way, and saves their first frame as a cover image. Chrome records the
// tab itself (H.264 MP4), so nothing else needs installing. The clips are written to
// apps/web/public/projects/<slug>-clip.mp4, the covers to <slug>-cover.webp.
//
//   node tools/record-clips.mjs [slug ...]
//
// Needs Google Chrome (CHROME_PATH overrides the macOS default) and a network connection. Ikitai is an app, so
// its clip has to come from a screen recording of the app itself. Two previews come from apps running on this
// computer: Spam the Mempool's client (`npm run dev:client` in ~/Development/spamthemempool, port 6069) and
// ShigoShima (`npm run dev` in ~/Development/shigoshima, port 5417).
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
// `dismiss` lists the text of banners to close first, as a visitor would. A preview can instead `setup` its page
// (an async function run there first), get it ready `before` recording (another, run once the page has the
// recording's size) and play its own `motion` (an async function given the clip's length in milliseconds);
// `cover` also saves its first frame.
const clips = [
  { slug: 'taplog', url: 'https://taplog.jp/', scroll: 760 },
  { slug: 'fairmints', url: 'https://fairmints.io/', scroll: 640 },
  {
    slug: 'festcompass',
    url: 'https://festcompass.jp/festivals',
    scroll: 820,
    dismiss: ['Install FestCompass'],
  },
  { slug: 'gengofriends', url: 'https://gengofriends.com/', scroll: 800, cover: true },
  {
    // A solo match against bots, with the player steered to grab junk and throw it onto the belt.
    slug: 'spam-the-mempool',
    url: 'http://localhost:6069/',
    seconds: 8,
    bitrate: 1_600_000,
    cover: true,
    setup: async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const style = document.createElement('style');
      // The first-match tips and the keyboard legend.
      style.textContent = '.coach, .legend { display: none !important; }';
      document.head.append(style);
      const stm = window.__stm;
      await stm.setPhase('match');
      await wait(5000);
      stm.fastForward(6);
      let pressUntil = 0;
      let lastPress = 0;
      let carrySince = 0;
      const press = (now) => {
        pressUntil = now + 120;
        lastPress = now;
      };
      const steer = (now) => {
        const snap = stm.snap();
        const me = snap?.players.find((player) => player.id === 'you');
        if (me) {
          const input = { mx: 0, mz: 0, grab: now < pressUntil };
          let dx = 0;
          let dz = 0;
          if (me.carrying != null && me.carrying >= 0) {
            // To the belt at the back, then throw.
            carrySince ||= now;
            dx = Math.max(-5, Math.min(5, -me.pos[0] * 0.3));
            dz = -4.2 - me.pos[2];
            const distance = Math.hypot(dx, dz);
            if ((distance < 1.6 || now - carrySince > 2600) && now - lastPress > 700) press(now);
            if (distance < 0.6) dx = dz = 0;
          } else {
            // To the nearest loose junk, then grab it.
            carrySince = 0;
            let nearest = Infinity;
            for (const junk of snap.junk) {
              if (junk.state !== 'loose') continue;
              const distance = Math.hypot(junk.pos[0] - me.pos[0], junk.pos[2] - me.pos[2]);
              if (distance < nearest) {
                nearest = distance;
                dx = junk.pos[0] - me.pos[0];
                dz = junk.pos[2] - me.pos[2];
              }
            }
            if (nearest < 0.9) {
              if (now - lastPress > 500) press(now);
              dx = dz = 0;
            }
          }
          const length = Math.hypot(dx, dz);
          if (length) Object.assign(input, { mx: dx / length, mz: dz / length });
          input.grab = now < pressUntil;
          stm.drive(input);
        }
        requestAnimationFrame(steer);
      };
      requestAnimationFrame(steer);
      await wait(4000);
    },
    motion: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  },
  {
    // The archipelago, then a flight to Ikitai's island and back.
    slug: 'shigoshima',
    url: 'http://127.0.0.1:5417/?intro=0',
    seconds: 9,
    bitrate: 900_000,
    cover: true,
    setup: async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const style = document.createElement('style');
      // Without the AI usage meters or the island's status card, naming only the islands of projects shown on
      // the site.
      const shown = ['ikitai', 'festcompass', 'taplog', 'fairmints', 'gengofriends', 'shigoshima'];
      style.textContent = `.usage-indicators, .island-card { display: none !important; }
        .village-label--project:not(${shown.map((name) => `:has(img[src*="${name}"])`).join(', ')}) { display: none !important; }`;
      document.head.append(style);
      await wait(4000);
    },
    // Going to the island and back, at the recording's size, frames the overview as it will be when the clip
    // ends, so it loops. The first trip back can return to the opening view instead, so it goes twice.
    before: async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      for (let trip = 0; trip < 2; trip++) {
        [...document.querySelectorAll('.village-label')]
          .find((label) => label.textContent.trim().startsWith('Ikitai'))
          .click();
        await wait(3000);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await wait(3500);
      }
    },
    motion: async (ms) => {
      const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));
      await wait(1200);
      [...document.querySelectorAll('.village-label')]
        .find((label) => label.textContent.trim().startsWith('Ikitai'))
        .click();
      await wait(ms - 1200 - 2800);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await wait(2800);
    },
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

// The products' motion: a pause at the top, eased down `distance` pixels, a pause at the bottom, back up.
const scrolling = (distance) => `async (ms) => {
  const distance = Math.min(${distance}, document.documentElement.scrollHeight - innerHeight);
  const start = performance.now();
  await new Promise((resolve) => {
    const step = (now) => {
      const t = (now - start) / ms;
      if (t >= 1) return resolve();
      const phase = Math.min(1, Math.max(0, t < 0.5 ? (t - 0.08) / 0.34 : (0.92 - t) / 0.34));
      // Instant, or a site's smooth scrolling would restart on every frame.
      window.scrollTo({ top: distance * phase * phase * (3 - 2 * phase), behavior: 'instant' });
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}`;

// Runs in the page: records the tab while the clip's motion plays, and grabs its first frame for the cover.
// While a tab is shared Chrome shows a bar above it, so if the page is no longer 1280 × 720 it stops and reports
// its size.
const record = ({ motion, before, seconds, size, bitrate, cover }) => `(async () => {
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
  window.scrollTo(0, 0);
  await (${before})();
  recorder.start();
  const played = (${motion})(${seconds * 1000});
  let image;
  if (${cover}) {
    const frame = await new ImageCapture(stream.getVideoTracks()[0]).grabFrame();
    const canvas = new OffscreenCanvas(frame.width, frame.height);
    canvas.getContext('2d').drawImage(frame, 0, 0);
    image = await canvas.convertToBlob({ type: 'image/webp', quality: 0.82 });
  }
  await played;
  recorder.stop();
  await stopped;
  stream.getTracks().forEach((track) => track.stop());
  const base64 = async (blob) => {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000)
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  };
  return {
    video: await base64(new Blob(chunks, { type })),
    cover: image && (await base64(image)),
  };
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
      const ready = await page.send('Runtime.evaluate', {
        expression: clip.setup ? `(${clip.setup})()` : prepare(clip.scroll, clip.dismiss ?? []),
        awaitPromise: true,
      });
      if (ready.exceptionDetails)
        throw new Error(
          `${clip.slug}: ${ready.exceptionDetails.exception?.description ?? ready.exceptionDetails.text}`,
        );
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
          expression: record({
            motion: clip.motion ? String(clip.motion) : scrolling(clip.scroll),
            seconds: clip.seconds ?? SECONDS,
            size: SIZE,
            bitrate: clip.bitrate ?? BITRATE,
            // A 3D scene redraws for the new size, so a preview waits a little longer by default.
            before:
              clip.before ??
              `() => new Promise((resolve) => setTimeout(resolve, ${clip.setup ? 1500 : 300}))`,
            cover: !!clip.cover,
          }),
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
      if (recorded.cover) {
        const image = Buffer.from(recorded.cover, 'base64');
        writeFileSync(join(outDir, `${clip.slug}-cover.webp`), image);
        console.log(`projects/${clip.slug}-cover.webp  ${Math.round(image.length / 1024)} KB`);
      }
    }
    page.close();
  } finally {
    chrome.kill();
    await sleep(300);
    rmSync(profileDir, { recursive: true, force: true });
  }
}

await main();
