import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'beyond-content-'));
process.env.DATABASE_URL = `file:${join(temporaryDirectory, 'nested', 'test.db')}`;
const root = fileURLToPath(new URL('../../../', import.meta.url));
const npm = process.env.npm_execpath;
const run = (script) =>
  execFileSync(process.execPath, [npm, 'run', script], {
    cwd: root,
    env: process.env,
    stdio: 'pipe',
  });
const { createApp } = await import('../dist/app.js');
const { createDatabase } = await import('../dist/database.js');
const { ContactService } = await import('../dist/contact.js');
// Importing the app reads apps/api/.env. Tests never post to the real Slack channel or call Claude.
for (const name of ['SLACK_WEBHOOK_CONTACT', 'ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN'])
  delete process.env[name];
// Nor do they load the assistant's sentence model; its matching is tested with a stand-in.
process.env.ASSISTANT_MODEL = 'off';
let db;
let app;
let base;

async function startApp() {
  app = await createApp({ serveWeb: false, logger: false });
  await app.listen(0, '127.0.0.1');
  base = await app.getUrl();
}
const get = (path) => fetch(`${base}/api/${path}`);

before(async () => {
  // Exercise the documented migration/seed commands against a brand-new file.
  run('db:migrate');
  run('db:seed');
  db = createDatabase();
  await startApp();
});
after(async () => {
  await app?.close();
  await db?.$disconnect();
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('seed updates known slugs, keeps IDs stable, and preserves unrelated records', async () => {
  const original = await db.project.findMany({ orderBy: { slug: 'asc' } });
  assert.equal(original.length, 10);
  const custom = await db.project.create({
    data: {
      slug: 'unrelated-draft',
      name: 'Unrelated work',
      summary: 'Keep this',
      description: 'Private draft description',
      audience: 'Private audience',
      url: 'https://example.com',
      category: 'Draft',
      startedYear: 2026,
      internalNotes: 'Never expose this',
      displayOrder: -10,
    },
  });
  await db.project.update({ where: { slug: 'ikitai' }, data: { summary: 'Outdated copy' } });
  run('db:seed');
  run('db:seed');
  const seeded = await db.project.findMany({
    where: { slug: { not: 'unrelated-draft' } },
    orderBy: { slug: 'asc' },
  });
  assert.deepEqual(
    seeded.map(({ id }) => id),
    original.map(({ id }) => id),
  );
  assert.equal(
    seeded.find(({ slug }) => slug === 'ikitai').summary,
    original.find(({ slug }) => slug === 'ikitai').summary,
  );
  assert.deepEqual(await db.project.findUnique({ where: { id: custom.id } }), custom);
  assert.equal(await db.project.count(), 11);
});

test('projects are ordered, filtered by publication, and limited to public fields', async () => {
  const response = await get('projects');
  assert.equal(response.status, 200);
  const projects = await response.json();
  const order = [
    'ikitai',
    'fairmints',
    'festcompass',
    'taplog',
    'gengofriends',
    'spam-the-mempool',
    'shigoshima',
    'ownest',
    'ledgys',
    'cryptofr',
  ];
  assert.deepEqual(
    projects.map(({ slug }) => slug),
    order,
  );
  assert.equal(projects[1].startedYear, 2024);
  assert.deepEqual(
    projects.filter(({ kind }) => kind === 'product').map(({ slug }) => slug),
    ['ikitai', 'fairmints', 'festcompass', 'taplog'],
  );
  assert.equal(projects[0].stage, 'review');
  assert.deepEqual(projects[1].languages, ['en', 'ja', 'zh']);
  assert.equal(projects.find(({ slug }) => slug === 'ownest').endedYear, 2026);
  const expectedFields = [
    'slug',
    'name',
    'summary',
    'description',
    'audience',
    'url',
    'category',
    'role',
    'startedYear',
    'status',
    'featured',
    'logoUrl',
    'imageUrl',
    'mobileImageUrl',
    'imageAlt',
    'imageCaption',
    'stack',
    'kind',
    'market',
    'stage',
    'platforms',
    'languages',
    'endedYear',
  ].sort();
  for (const project of projects) assert.deepEqual(Object.keys(project).sort(), expectedFields);
  assert.deepEqual(
    projects.filter((p) => p.market === 'japan').map((p) => p.slug),
    ['festcompass', 'taplog'],
  );
  for (const project of projects) {
    assert.ok(project.stack.length > 0);
    assert.ok(project.stack.every((item) => typeof item === 'string'));
  }
  assert.ok(projects[1].stack.includes('Counterparty'));
  // Japanese text replaces the English field by field, with the same public fields.
  const japanese = await (await get('projects?lang=ja')).json();
  assert.deepEqual(
    japanese.map(({ slug }) => slug),
    order,
  );
  for (const project of japanese) assert.deepEqual(Object.keys(project).sort(), expectedFields);
  assert.equal(japanese[0].summary, 'スクショを、そのまま予定に。');
  assert.equal(japanese[0].name, 'Ikitai');
  assert.deepEqual(japanese[1].stack, projects[1].stack);
  assert.equal(japanese[1].role, null);
  assert.equal((await (await get('projects?lang=fr')).json())[0].summary, projects[0].summary);
  assert.ok(!JSON.stringify(projects).includes('Never expose this'));
  await db.project.update({ where: { slug: 'fairmints' }, data: { published: false } });
  assert.deepEqual(
    (await (await get('projects')).json()).map(({ slug }) => slug),
    order.filter((slug) => slug !== 'fairmints'),
  );
  await db.project.update({ where: { slug: 'fairmints' }, data: { published: true } });
});

test('API is read-only, profile is available, and health checks the database', async () => {
  assert.deepEqual(await (await get('health')).json(), { status: 'ok' });
  const profile = await (await get('profile')).json();
  assert.equal(profile.handle, 'ffmad');
  // The personal page follows the CV: its title, and its experience newest first.
  assert.match(profile.headline, /Frontend and full-stack engineer/);
  assert.deepEqual(
    profile.experience.map((item) => item.name),
    ['Beyond Blockchain', 'Fairmints', 'Ownest', 'Ledgys', 'CryptoFR', 'Avisto', 'CommOnEcoute'],
  );
  const japaneseProfile = await (await get('profile?lang=ja')).json();
  assert.equal(japaneseProfile.handle, 'ffmad');
  assert.match(japaneseProfile.intro, /Beyond Blockchain/);
  assert.match(japaneseProfile.intro, /[ぁ-んァ-ン]/);
  assert.equal(japaneseProfile.experience.length, profile.experience.length);
  assert.equal(japaneseProfile.skills.length, profile.skills.length);
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal((await fetch(`${base}/api/projects`, { method })).status, 404);
  }
  assert.equal((await get('missing')).status, 404);
});

test('server-rendered pages include public content, isolate requests, and escape hydration data', async () => {
  const webApp = await createApp({ serveWeb: true, logger: false });
  await webApp.listen(0, '127.0.0.1');
  const webBase = await webApp.getUrl();
  const state = (html) =>
    JSON.parse(
      html.match(/<script id="initial-resources" type="application\/json">([\s\S]*?)<\/script>/)[1],
    );
  try {
    const [home, about, workResponse] = await Promise.all([
      fetch(webBase).then((response) => response.text()),
      fetch(`${webBase}/quentin`).then((response) => response.text()),
      fetch(`${webBase}/work/fairmints`),
    ]);
    // The product cards are in the server-rendered page, each linking to its own page; experiments and
    // earlier work are listed too.
    assert.match(home, /class="card-link" href="\/work\/fairmints"/);
    assert.match(home, /class="card-link" href="\/work\/taplog"/);
    assert.match(home, /Turn screenshots into plans/);
    assert.match(home, /In App Store review/);
    assert.match(home, /Spam the Mempool/);
    assert.match(home, /Pioneer in blockchain development since 2014/);
    assert.equal((await fetch(`${webBase}/work/ownest`)).status, 404);
    assert.equal(workResponse.status, 200);
    const work = await workResponse.text();
    assert.match(work, /id="work-fairmints"/);
    assert.match(work, /<h1[^>]*>Fairmints<\/h1>/);
    assert.match(work, /Counterparty/);
    assert.match(work, /<title>Fairmints — Beyond Blockchain<\/title>/);
    assert.match(
      work,
      /<link rel="canonical" href="https:\/\/beyondblockchain.com\/work\/fairmints">/,
    );
    assert.match(work, /content="index,follow,max-image-preview:large"/);
    // Each page has its own link preview, per language; a product without one uses the studio page's.
    assert.match(
      work,
      /<meta property="og:image" content="https:\/\/beyondblockchain\.com\/social\/work-fairmints\.en\.png">/,
    );
    assert.match(
      home,
      /og:image" content="https:\/\/beyondblockchain\.com\/social\/home\.en\.png"/,
    );
    assert.deepEqual(Object.keys(state(work)), ['/api/projects']);
    // Structured data describes the person, the site and the products, and only on indexed pages.
    const graph = (html) =>
      JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])[
        '@graph'
      ];
    const homeGraph = graph(home);
    assert.ok(
      homeGraph.some((node) => node['@type'] === 'Person' && node.alternateName === 'ffmad'),
    );
    const list = homeGraph.find((node) => node['@type'] === 'ItemList');
    assert.deepEqual(
      list.itemListElement.map(({ item }) => item.name),
      ['Ikitai', 'Fairmints', 'FestCompass', 'TapLog'],
    );
    const app = graph(work).find((node) => node['@type'] === 'SoftwareApplication');
    assert.equal(app.name, 'Fairmints');
    assert.equal(app.url, 'https://fairmints.io');
    const unknownWork = await fetch(`${webBase}/work/not-a-project`);
    assert.equal(unknownWork.status, 404);
    const unknownHtml = await unknownWork.text();
    assert.match(unknownHtml, /noindex,follow/);
    assert.ok(!unknownHtml.includes('application/ld+json'));
    // A plain summary for AI assistants, from the same published content.
    const llms = await fetch(`${webBase}/llms.txt`);
    assert.equal(llms.status, 200);
    assert.match(llms.headers.get('content-type'), /text\/markdown/);
    const llmsBody = await llms.text();
    assert.match(llmsBody, /^# Beyond Blockchain\n\n> /);
    assert.match(llmsBody, /\[TapLog\]\(https:\/\/beyondblockchain\.com\/work\/taplog\)/);
    assert.match(
      llmsBody,
      /## Work in progress[\s\S]*\[GengoFriends\]\(https:\/\/gengofriends\.com\) \(in beta[\s\S]*Spam the Mempool \(coming soon/,
    );
    assert.match(
      llmsBody,
      /## Earlier work[\s\S]*\[Ownest\]\(https:\/\/ownest\.io\) \(2017–2026\), CEO and co-founder/,
    );
    assert.ok(!llmsBody.includes('Never expose this'));
    // English pages point to their Japanese versions, which live under /ja with their own text and links.
    assert.match(home, /<html lang="en">/);
    assert.match(home, /hreflang="ja" href="https:\/\/beyondblockchain.com\/ja\/"/);
    const [jaHome, jaWork, jaAbout, jaMissing] = await Promise.all([
      fetch(`${webBase}/ja/`),
      fetch(`${webBase}/ja/work/fairmints`),
      fetch(`${webBase}/ja/quentin`),
      fetch(`${webBase}/ja/work/not-a-project`),
    ]);
    assert.equal(jaHome.status, 200);
    const jaHomeHtml = await jaHome.text();
    assert.match(jaHomeHtml, /<html lang="ja">/);
    assert.match(jaHomeHtml, /スクショを、そのまま予定に。/);
    assert.match(jaHomeHtml, /href="\/ja\/work\/fairmints"/);
    assert.match(jaHomeHtml, /<link rel="canonical" href="https:\/\/beyondblockchain.com\/ja\/">/);
    assert.match(jaHomeHtml, /hreflang="en" href="https:\/\/beyondblockchain.com\/"/);
    assert.deepEqual(Object.keys(state(jaHomeHtml)), ['/api/projects?lang=ja']);
    assert.equal(jaWork.status, 200);
    const jaWorkHtml = await jaWork.text();
    assert.match(jaWorkHtml, /<h1[^>]*>Fairmints<\/h1>/);
    assert.match(jaWorkHtml, /ビットコインで、つくって取引する。/);
    assert.match(
      jaWorkHtml,
      /<link rel="canonical" href="https:\/\/beyondblockchain.com\/ja\/work\/fairmints">/,
    );
    assert.equal(jaAbout.status, 200);
    const jaAboutHtml = await jaAbout.text();
    assert.match(jaAboutHtml, /こんにちは、/);
    assert.deepEqual(Object.keys(state(jaAboutHtml)), ['/api/profile?lang=ja']);
    assert.equal(jaMissing.status, 404);
    assert.match(
      jaHomeHtml,
      /og:image" content="https:\/\/beyondblockchain\.com\/social\/home\.ja\.png"/,
    );
    const preview = await db.project.create({
      data: {
        slug: 'no-preview-yet',
        name: 'No preview yet',
        summary: 'Test',
        description: 'Test',
        audience: 'Test',
        url: 'https://example.com',
        category: 'Test',
        startedYear: 2026,
        published: true,
        displayOrder: 99,
      },
    });
    try {
      const fallback = await (await fetch(`${webBase}/work/no-preview-yet`)).text();
      assert.match(
        fallback,
        /og:image" content="https:\/\/beyondblockchain\.com\/social\/home\.en\.png"/,
      );
    } finally {
      await db.project.delete({ where: { id: preview.id } });
    }
    assert.match(about, /Commission consultative Épargnants/);
    assert.match(about, /The Nakamotos Club/);
    const compressed = await fetch(webBase, { headers: { 'Accept-Encoding': 'gzip' } });
    assert.equal(compressed.headers.get('content-encoding'), 'gzip');
    assert.match(await compressed.text(), /href="\/work\/fairmints"/);
    const clientAsset = home.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
    const assetResponse = await fetch(`${webBase}${clientAsset}`);
    assert.equal(assetResponse.status, 200);
    assert.match(assetResponse.headers.get('cache-control'), /immutable/);
    await assetResponse.arrayBuffer();
    assert.deepEqual(Object.keys(state(home)), ['/api/projects']);
    assert.deepEqual(Object.keys(state(about)), ['/api/profile']);
    assert.ok(!home.includes('Never expose this'));
    assert.ok(!home.includes('internalNotes'));
    assert.ok(!home.includes('unrelated-draft'));
    const missing = await fetch(`${webBase}/not-a-page`);
    assert.equal(missing.status, 404);
    const missingHtml = await missing.text();
    assert.match(missingHtml, /noindex,follow/);
    assert.doesNotMatch(missingHtml, /rel="canonical"/);
    assert.match(home, /index,follow,max-image-preview:large/);
    assert.match(home, /og:locale:alternate" content="ja_JP"/);
    assert.equal((await fetch(`${webBase}/api/not-an-endpoint`)).status, 404);
    assert.equal((await fetch(`${webBase}/api/projects`)).headers.get('x-robots-tag'), 'noindex');

    // Each page has one address: duplicates redirect permanently, keeping the query.
    for (const [from, to] of [
      ['/index.html', '/'],
      ['/ja', '/ja/'],
      ['/quentin/', '/quentin'],
      ['/ja/quentin/', '/ja/quentin'],
      ['/work/taplog/?ref=x', '/work/taplog?ref=x'],
    ]) {
      const response = await fetch(`${webBase}${from}`, { redirect: 'manual' });
      assert.equal(response.status, 301, from);
      assert.equal(response.headers.get('location'), to, from);
    }
    for (const page of ['/', '/ja/', '/quentin', '/work/taplog', '/sitemap.xml'])
      assert.equal((await fetch(`${webBase}${page}`, { redirect: 'manual' })).status, 200, page);

    const original = await db.project.findUnique({ where: { slug: 'ikitai' } });
    const unsafe = '</script><script>alert("content")</script>';
    await db.project.update({ where: { slug: 'ikitai' }, data: { summary: unsafe } });
    try {
      const updated = await (await fetch(webBase)).text();
      assert.ok(!updated.includes(unsafe));
      assert.match(updated, /&lt;\/script&gt;/);
      assert.equal(state(updated)['/api/projects'].data[0].summary, unsafe);
    } finally {
      await db.project.update({ where: { slug: 'ikitai' }, data: { summary: original.summary } });
    }
  } finally {
    await webApp.close();
  }
});

test('the sitemap lists every page in both languages, from the published products', async () => {
  const response = await fetch(`${base}/sitemap.xml`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/xml/);
  const xml = await response.text();
  const pages = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const products = ['ikitai', 'fairmints', 'festcompass', 'taplog'];
  assert.deepEqual(pages, [
    'https://beyondblockchain.com/',
    'https://beyondblockchain.com/ja/',
    'https://beyondblockchain.com/quentin',
    'https://beyondblockchain.com/ja/quentin',
    ...products.flatMap((slug) => [
      `https://beyondblockchain.com/work/${slug}`,
      `https://beyondblockchain.com/ja/work/${slug}`,
    ]),
  ]);
  assert.match(xml, /hreflang="x-default" href="https:\/\/beyondblockchain\.com\/work\/taplog"/);
  // Work in progress and earlier work have no page of their own.
  assert.doesNotMatch(xml, /gengofriends|ownest/);
});

test('project changes and unrelated additions persist across server restarts', async () => {
  await db.project.update({
    where: { slug: 'festcompass' },
    data: { summary: 'Persisted test change' },
  });
  await app.close();
  await startApp();
  const projects = await (await get('projects')).json();
  assert.equal(
    projects.find(({ slug }) => slug === 'festcompass').summary,
    'Persisted test change',
  );
  assert.ok(await db.project.findUnique({ where: { slug: 'unrelated-draft' } }));
});

test('the contact form validates, filters bots, saves, delivers to Slack and rate-limits', async () => {
  const post = (body) =>
    fetch(`${base}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  const until = async (check) => {
    for (let i = 0; i < 100 && !(await check()); i++) await new Promise((r) => setTimeout(r, 20));
    assert.ok(await check());
  };
  const valid = {
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hello there',
    locale: 'ja',
    page: '/work/ikitai',
    elapsed: 5000,
  };
  const invalid = await post({ ...valid, email: 'not-an-address', message: '' });
  assert.equal(invalid.status, 400);
  assert.deepEqual((await invalid.json()).fields, ['email', 'message']);
  // A filled hidden field or an instant submission is accepted and quietly dropped.
  assert.equal((await post({ ...valid, website: 'https://spam.example' })).status, 202);
  assert.equal((await post({ ...valid, elapsed: 200 })).status, 202);
  assert.equal(await db.contactMessage.count(), 0);

  // Without a webhook the message waits in the database.
  delete process.env.SLACK_WEBHOOK_CONTACT;
  assert.equal((await post(valid)).status, 202);
  assert.equal((await db.contactMessage.findFirst()).delivery, 'pending');

  // With one, waiting and new messages are delivered, with the sender's text as plain text.
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (!String(url).startsWith('https://hooks.slack.com/')) return realFetch(url, init);
    sent.push(JSON.parse(init.body));
    return new Response('ok');
  };
  process.env.SLACK_WEBHOOK_CONTACT = 'https://hooks.slack.com/services/T0000/B0000/abcdEFGH1234';
  try {
    // A message from the site's assistant carries what the visitor asked it first.
    const asked = 'Can you work with me? · What’s your stack?';
    assert.equal(
      (await post({ ...valid, message: '<!channel> please call me', asked })).status,
      202,
    );
    await until(async () => (await db.contactMessage.count({ where: { delivery: 'sent' } })) === 2);
    assert.equal(sent.length, 2);
    assert.equal((await db.contactMessage.findFirst({ where: { asked } }))?.asked, asked);
    const fromAssistant = sent.find((p) => JSON.stringify(p).includes('please call me'));
    assert.ok(
      fromAssistant.blocks.some(
        (block) =>
          block.type === 'context' &&
          block.elements[0].type === 'plain_text' &&
          block.elements[0].text === `Asked the site's assistant: ${asked}`,
      ),
    );
    for (const payload of sent) {
      assert.ok(!payload.text.includes('<!channel>'));
      const typed = payload.blocks.filter((block) => block.type === 'section').slice(0, 2);
      assert.ok(typed.every((block) => block.text.type === 'plain_text'));
    }
    assert.ok(sent.some((p) => JSON.stringify(p).includes('<!channel> please call me')));
    // Five messages an hour from one address; the two saved ones count.
    for (let i = 0; i < 3; i++) assert.equal((await post(valid)).status, 202);
    assert.equal((await post(valid)).status, 429);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.SLACK_WEBHOOK_CONTACT;
  }
  // A webhook that isn't Slack's is ignored.
  process.env.SLACK_WEBHOOK_CONTACT = 'https://example.com/services/T0000/B0000/abcd';
  const { contactWebhook } = await import('../dist/contact.js');
  assert.equal(contactWebhook(), null);
  delete process.env.SLACK_WEBHOOK_CONTACT;
});

test('the assistant knows the same facts in both languages and answers by meaning', async () => {
  const { knowledge } = await import('../dist/content/knowledge.js');
  const { KnowledgeIndex, questionLanguage } = await import('../dist/assistant.js');
  const ids = (list) => list.map((fact) => fact.id);
  assert.deepEqual(ids(knowledge.ja), ids(knowledge.en));
  for (const fact of [...knowledge.en, ...knowledge.ja]) {
    assert.ok(fact.answer && fact.asks.length >= 2, fact.id);
    if (fact.link) assert.match(fact.link.to, /^(\/|https:\/\/)/, fact.id);
  }
  assert.equal(questionLanguage('Can I hire you?'), 'en');
  assert.equal(questionLanguage('TapLogとは？'), 'ja');

  // A stand-in for the sentence model: words (or, in Japanese, characters) as dimensions.
  const embed = async (texts) =>
    texts.map((text) => {
      const vector = new Array(512).fill(0);
      const tokens = /[\u3040-\u9fff]/.test(text) ? [...text] : text.toLowerCase().split(/\W+/);
      for (const token of tokens.filter(Boolean)) {
        let hash = 0;
        for (const char of token) hash = (hash * 31 + char.codePointAt(0)) % 512;
        vector[hash] += 1;
      }
      const norm = Math.hypot(...vector) || 1;
      return vector.map((x) => x / norm);
    });
  const index = await new KnowledgeIndex(embed).build();
  assert.equal((await index.match('What is TapLog?')).fact.id, 'taplog');
  assert.equal((await index.match('Can my bar be on TapLog?')).fact.id, 'bar');
  // "Quentin" and "he" are read as "you".
  assert.equal((await index.match('Is Quentin open to work?')).fact.id, 'work');
  const japanese = await index.match('TapLogに自分のバーを載せられますか？');
  assert.equal(japanese.fact.id, 'bar');
  assert.match(japanese.fact.answer, /[ぁ-ん]/);

  // Turned off (as in these tests), it says so after checking the question and the visitor's rate.
  const ask = (body) =>
    fetch(`${base}/api/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  assert.equal((await ask({ question: '' })).status, 400);
  assert.equal((await ask({ question: 'x'.repeat(301) })).status, 400);
  assert.equal((await ask({ question: 'What is TapLog?' })).status, 503);
});

test('Claude triage adds notes before Slack, without the sender email, and never blocks delivery', async () => {
  await db.contactMessage.deleteMany();
  const sent = [];
  const asked = [];
  let anthropicFails = false;
  const notes = {
    summary: 'A recruiter asks whether Quentin is open to a frontend role.',
    language: 'Japanese',
    kind: 'job or hiring',
    spam: false,
    reply: 'ご連絡ありがとうございます。[空いている日時]にお話しできます。Quentin',
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const address = String(url instanceof Request ? url.url : url);
    if (address.startsWith('https://hooks.slack.com/')) {
      sent.push(JSON.parse(init.body));
      return new Response('ok');
    }
    if (address.startsWith('https://api.anthropic.com/')) {
      asked.push(JSON.parse(init.body));
      if (anthropicFails) return new Response('{"type":"error"}', { status: 500 });
      return Response.json({
        id: 'msg_test',
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-5-5',
        content: [{ type: 'text', text: JSON.stringify(notes) }],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 10 },
      });
    }
    return realFetch(url, init);
  };
  process.env.SLACK_WEBHOOK_CONTACT = 'https://hooks.slack.com/services/T0000/B0000/abcdEFGH1234';
  process.env.ANTHROPIC_API_KEY = 'test-key';
  const service = app.get(ContactService);
  const create = (message) =>
    db.contactMessage.create({
      data: { name: 'Aiko', email: 'aiko@example.jp', message, locale: 'ja', page: '/ja/' },
    });
  try {
    await create('フロントエンドのポジションについてご相談できますか？');
    await service.deliverDue();
    assert.equal(asked.length, 1);
    assert.equal(asked[0].model, 'claude-opus-5-5');
    assert.ok(!JSON.stringify(asked[0]).includes('aiko@example.jp'));
    assert.equal(sent.length, 1);
    const blocks = JSON.stringify(sent[0].blocks);
    assert.ok(blocks.includes(notes.summary));
    assert.ok(blocks.includes('Draft reply'));
    assert.ok(blocks.includes(encodeURIComponent(notes.reply)));
    const saved = await db.contactMessage.findFirst();
    assert.equal(saved.delivery, 'sent');
    assert.deepEqual(saved.triage, notes);

    // If Claude is unavailable, the message still arrives, just without notes.
    anthropicFails = true;
    await create('もう一つ質問があります。');
    await service.deliverDue();
    assert.equal(sent.length, 2);
    assert.ok(!JSON.stringify(sent[1].blocks).includes('Draft reply'));
    assert.equal(await db.contactMessage.count({ where: { delivery: 'sent' } }), 2);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.SLACK_WEBHOOK_CONTACT;
    delete process.env.ANTHROPIC_API_KEY;
  }
});

test('database failures return 503 without exposing SQL or private content', async () => {
  await db.$executeRawUnsafe('DROP TABLE "Project"');
  for (const endpoint of ['health', 'projects']) {
    const response = await get(endpoint);
    assert.equal(response.status, 503);
    const body = await response.text();
    assert.ok(!body.includes('SELECT'));
    assert.ok(!body.includes(temporaryDirectory));
    assert.ok(!body.includes('Never expose this'));
  }
  const webApp = await createApp({ serveWeb: true, logger: false });
  await webApp.listen(0, '127.0.0.1');
  try {
    const response = await fetch(await webApp.getUrl());
    assert.equal(response.status, 503);
    const html = await response.text();
    assert.match(html, /initial-resources/);
    assert.match(html, /"error":true/);
    assert.ok(!html.includes(temporaryDirectory));
    assert.ok(!html.includes('SELECT'));
  } finally {
    await webApp.close();
  }
});
