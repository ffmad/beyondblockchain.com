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
  assert.equal(original.length, 3);
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
  assert.equal(await db.project.count(), 4);
});

test('projects are ordered, filtered by publication, and limited to public fields', async () => {
  const response = await get('projects');
  assert.equal(response.status, 200);
  const projects = await response.json();
  assert.deepEqual(
    projects.map(({ slug }) => slug),
    ['ikitai', 'fairmints', 'festcompass'],
  );
  assert.equal(projects[1].startedYear, 2024);
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
  ].sort();
  for (const project of projects) assert.deepEqual(Object.keys(project).sort(), expectedFields);
  assert.ok(!JSON.stringify(projects).includes('Never expose this'));
  await db.project.update({ where: { slug: 'fairmints' }, data: { published: false } });
  assert.deepEqual(
    (await (await get('projects')).json()).map(({ slug }) => slug),
    ['ikitai', 'festcompass'],
  );
  await db.project.update({ where: { slug: 'fairmints' }, data: { published: true } });
});

test('API is read-only, profile is available, and health checks the database', async () => {
  assert.deepEqual(await (await get('health')).json(), { status: 'ok' });
  assert.equal((await (await get('profile')).json()).handle, 'ffmad');
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal((await fetch(`${base}/api/projects`, { method })).status, 404);
  }
  assert.equal((await get('missing')).status, 404);
});

test('server-rendered pages include public content, isolate requests, and escape hydration data', async () => {
  const webApp = await createApp({ serveWeb: true, logger: false });
  await webApp.listen(0, '127.0.0.1');
  const webBase = await webApp.getUrl();
  try {
    const [home, about] = await Promise.all([
      fetch(webBase).then((response) => response.text()),
      fetch(`${webBase}/quentin`).then((response) => response.text()),
    ]);
    assert.match(home, /id="work-fairmints"/);
    assert.match(home, /Turn screenshots into plans/);
    assert.match(about, /Commission consultative Épargnants/);
    assert.match(about, /The Nakamotos Club/);
    const compressed = await fetch(webBase, { headers: { 'Accept-Encoding': 'gzip' } });
    assert.equal(compressed.headers.get('content-encoding'), 'gzip');
    assert.match(await compressed.text(), /id="work-fairmints"/);
    const clientAsset = home.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
    const assetResponse = await fetch(`${webBase}${clientAsset}`);
    assert.equal(assetResponse.status, 200);
    assert.match(assetResponse.headers.get('cache-control'), /immutable/);
    await assetResponse.arrayBuffer();
    const state = (html) =>
      JSON.parse(
        html.match(
          /<script id="initial-resources" type="application\/json">([\s\S]*?)<\/script>/,
        )[1],
      );
    assert.deepEqual(Object.keys(state(home)), ['/api/projects']);
    assert.deepEqual(Object.keys(state(about)), ['/api/profile']);
    assert.ok(!home.includes('Never expose this'));
    assert.ok(!home.includes('internalNotes'));
    assert.ok(!home.includes('unrelated-draft'));
    const missing = await fetch(`${webBase}/not-a-page`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /noindex,follow/);
    assert.equal((await fetch(`${webBase}/api/not-an-endpoint`)).status, 404);

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
