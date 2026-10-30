// Renders the 1200 × 630 link previews (Open Graph and X cards) for every public page in both languages:
// the studio page, /quentin and each product page. The text comes from a running server, so previews match the
// pages; the images are written to apps/web/public/social.
//
//   npm run build && PORT=3200 npm start      # in another terminal
//   node tools/share-cards.mjs [--base http://localhost:3200]
//
// Needs Google Chrome (CHROME_PATH overrides the macOS default). Run it again when a product is added or changes.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicDir = join(root, 'apps/web/public');
const outDir = join(publicDir, 'social');
const base = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:3200';
const chromePath =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9341;

const asset = (path) => pathToFileURL(join(publicDir, path)).href;
const font = (path) => pathToFileURL(join(root, 'node_modules', path)).href;
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const text = {
  en: {
    tagline: ['Pioneer in blockchain development since 2014.', 'Building beyond it with AI.'],
    person: 'Frontend and full-stack engineer · Tokyo',
    personStack: 'Vue 3, TypeScript, NestJS · AI-assisted development',
    now: 'Now building',
    by: 'A project by Quentin de Beauchesne',
    stage: { live: 'Live', review: 'In App Store review', beta: 'Beta', soon: 'Coming soon' },
    market: { japan: 'For Japan' },
  },
  ja: {
    tagline: [
      '2014年からブロックチェーン開発の先駆者として。',
      'いまはAIで、その先をつくっています。',
    ],
    person: 'フロントエンド／フルスタックエンジニア · 東京',
    personStack: 'Vue 3、TypeScript、NestJS · AIを活用した開発',
    now: 'いまつくっているもの',
    by: 'Quentin de Beauchesneのプロジェクト',
    stage: { live: '公開中', review: 'App Store審査中', beta: 'ベータ版', soon: '近日公開' },
    market: { japan: '日本向け' },
  },
};
const platformNames = { web: 'Web', ios: 'iOS', android: 'Android' };

const style = `
@font-face { font-family: 'Bricolage'; src: url('${font('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wdth-normal.woff2')}'); font-weight: 200 800; font-stretch: 75% 100%; }
@font-face { font-family: 'DM Sans'; src: url('${font('@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2')}'); font-weight: 400; }
@font-face { font-family: 'DM Sans'; src: url('${font('@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2')}'); font-weight: 500; }
@font-face { font-family: 'DM Mono'; src: url('${font('@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2')}'); font-weight: 400; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; background: #f5f4f0; color: #0c1424; font-family: 'DM Sans', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif; -webkit-font-smoothing: antialiased; }
.ja .display, .ja h1, .ja .tagline { letter-spacing: 0; }
/* Japanese lines break between phrases, never inside one. */
.ja p { word-break: auto-phrase; line-break: strict; }
.top { position: absolute; left: 64px; right: 64px; top: 48px; display: flex; align-items: center; gap: 14px; font-family: 'Bricolage', sans-serif; font-weight: 700; font-stretch: 88%; font-size: 26px; letter-spacing: -0.01em; }
.top img { width: 40px; height: 43px; }
.url { margin-left: auto; font-family: 'DM Mono', monospace; font-weight: 400; font-size: 19px; letter-spacing: 0; color: #586174; }
.foot { position: absolute; left: 64px; bottom: 48px; font-size: 21px; color: #586174; }
h1, .display { font-family: 'Bricolage', 'Hiragino Sans', sans-serif; font-weight: 740; font-stretch: 86%; letter-spacing: -0.04em; line-height: 0.95; }
.logos { display: flex; flex-wrap: wrap; gap: 14px 30px; font-size: 24px; font-weight: 500; }
.logos span { display: inline-flex; align-items: center; gap: 12px; }
.logos img { width: 38px; height: 38px; border-radius: 9px; }
`;

function page(lang, body, extraStyle = '') {
  return `<!doctype html><html lang="${lang}" class="${lang}"><head><meta charset="utf-8"><style>${style}${extraStyle}</style></head><body>${body}</body></html>`;
}

const brand = `<img src="${asset('/brand/beyond-blockchain-mark.svg')}" alt="">`;
const logoRow = (products) =>
  `<div class="logos">${products
    .map(
      (p) =>
        `<span>${p.logoUrl ? `<img src="${asset(p.logoUrl)}" alt="">` : ''}${escape(p.name)}</span>`,
    )
    .join('')}</div>`;

function homeCard(lang, products) {
  const t = text[lang];
  return page(
    lang,
    `<div class="top">${brand}<span>Beyond Blockchain</span><span class="url">beyondblockchain.com${lang === 'ja' ? '/ja' : ''}</span></div>
     <div class="copy"><p class="display">Beyond<br>Blockchain</p>
       <p class="tagline">${t.tagline.map((line) => `<span>${escape(line)}</span>`).join('')}</p></div>
     <img class="mark" src="${asset('/brand/beyond-blockchain-mark.svg')}" alt="">
     <div class="bottom">${logoRow(products)}</div>`,
    `.copy { position: absolute; left: 64px; top: 140px; width: 760px; display: grid; gap: 26px; }
     .display { font-size: 104px; }
     .tagline { display: grid; font-size: ${lang === 'ja' ? 28 : 32}px; font-weight: 500; line-height: 1.3; }
     /* Each sentence keeps a line of its own. */
     .tagline span { white-space: nowrap; }
     .mark { position: absolute; right: 70px; top: 150px; width: 300px; filter: drop-shadow(0 30px 40px rgb(35 78 155 / 0.25)); }
     .bottom { position: absolute; left: 64px; right: 64px; bottom: 46px; padding-top: 26px; border-top: 1px solid #d9dbe1; }`,
  );
}

function personCard(lang, products) {
  const t = text[lang];
  return page(
    lang,
    `<div class="top">${brand}<span>Beyond Blockchain</span><span class="url">beyondblockchain.com${lang === 'ja' ? '/ja' : ''}/quentin</span></div>
     <div class="copy"><p class="display">Quentin<br>de Beauchesne</p>
       <p class="role">${escape(t.person)}</p><p class="stack">${escape(t.personStack)} · ffmad</p></div>
     <div class="bottom"><p class="now">${escape(t.now)}</p>${logoRow(products)}</div>`,
    `.copy { position: absolute; left: 64px; top: 128px; display: grid; gap: 18px; }
     .display { font-size: 96px; }
     .role { margin-top: 6px; font-size: ${lang === 'ja' ? 30 : 34}px; font-weight: 500; line-height: 1.2; }
     .stack { font-size: 22px; color: #586174; }
     .bottom { position: absolute; left: 64px; right: 64px; bottom: 46px; display: grid; gap: 14px; padding-top: 22px; border-top: 1px solid #d9dbe1; }
     .now { font-family: 'DM Mono', 'Hiragino Sans', monospace; font-size: 15px; letter-spacing: 0.06em; text-transform: uppercase; color: #586174; }`,
  );
}

function productCard(lang, project) {
  const t = text[lang];
  const phone = !project.mobileImageUrl;
  const facts = [
    project.category,
    project.stage && t.stage[project.stage],
    project.market && t.market[project.market],
    project.platforms.map((p) => platformNames[p] ?? p).join(' · '),
  ].filter(Boolean);
  return page(
    lang,
    `<div class="top">${brand}<span>Beyond Blockchain</span></div>
     <div class="copy">
       ${project.logoUrl ? `<img class="logo" src="${asset(project.logoUrl)}" alt="">` : ''}
       <h1>${escape(project.name)}</h1>
       <p class="summary">${escape(project.summary)}</p>
       <p class="facts">${facts.map(escape).join(' · ')}</p>
     </div>
     <div class="panel ${phone ? 'is-phone' : ''}"><img src="${asset(project.imageUrl)}" alt=""></div>
     <p class="foot">${escape(t.by)}<br><span class="link">beyondblockchain.com${lang === 'ja' ? '/ja' : ''}/work/${escape(project.slug)}</span></p>`,
    `.copy { position: absolute; left: 64px; top: 128px; width: 470px; display: grid; justify-items: start; gap: 20px; }
     .logo { width: 72px; height: 72px; border-radius: 18px; }
     h1 { font-size: ${project.name.length > 10 ? 76 : 92}px; }
     .summary { font-size: ${lang === 'ja' ? 30 : 34}px; font-weight: 500; line-height: 1.25; text-wrap: balance; }
     .facts { font-size: 21px; line-height: 1.4; color: #586174; }
     .foot { line-height: 1.5; font-size: 19px; }
     .link { font-family: 'DM Mono', monospace; font-size: 17px; }
     .panel { position: absolute; left: 590px; right: 0; top: 0; bottom: 0; overflow: hidden; background: #e7e9ee; }
     .panel img { position: absolute; left: 56px; top: 96px; width: 900px; border-radius: 16px 0 0 0; box-shadow: 0 24px 60px -24px rgb(12 20 36 / 0.45), 0 0 0 1px rgb(12 20 36 / 0.06); }
     .panel.is-phone img { left: 50%; width: 300px; translate: -50% 0; top: 70px; border: 9px solid #0b1222; border-radius: 40px; }`,
  );
}

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

async function main() {
  const get = async (path) => {
    const response = await fetch(new URL(path, base));
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
  };
  const content = {
    en: (await get('/api/projects')).filter((p) => p.kind === 'product'),
    ja: (await get('/api/projects?lang=ja')).filter((p) => p.kind === 'product'),
  };

  const profileDir = mkdtempSync(join(tmpdir(), 'share-cards-'));
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profileDir}`,
      '--hide-scrollbars',
      '--allow-file-access-from-files',
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
    await page.send('Emulation.setDeviceMetricsOverride', {
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const cards = [];
    for (const lang of ['en', 'ja']) {
      cards.push([`home.${lang}.png`, homeCard(lang, content[lang])]);
      cards.push([`quentin.${lang}.png`, personCard(lang, content[lang])]);
      for (const project of content[lang])
        cards.push([`work-${project.slug}.${lang}.png`, productCard(lang, project)]);
    }
    for (const [name, html] of cards) {
      const file = join(profileDir, `${name}.html`);
      writeFileSync(file, html);
      const loaded = page.once('Page.loadEventFired');
      await page.send('Page.navigate', { url: pathToFileURL(file).href });
      await loaded;
      await page.send('Runtime.evaluate', {
        expression:
          'document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))',
        awaitPromise: true,
      });
      const shot = await page.send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
      });
      writeFileSync(join(outDir, name), Buffer.from(shot.data, 'base64'));
      console.log(`social/${name}`);
    }
    page.close();
  } finally {
    chrome.kill();
    await sleep(300);
    rmSync(profileDir, { recursive: true, force: true });
  }
}

await main();
