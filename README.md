# Beyond Blockchain

Quentin de Beauchesne’s project website and personal profile. The homepage summarises Ikitai, Fairmints (since 2024), and FestCompass, each opening in a window over the page at its own address (`/work/<slug>`); `/quentin` covers previous work, community involvement, writing, and talks. Every page exists in English and in Japanese (under `/ja`).

Vue 3 + TypeScript + Vite on the frontend, NestJS on the backend, and SQLite through Prisma. Production pages are server-rendered by Vue and hydrated in the browser. Project content comes from the database; the profile lives in a typed content file.

## Run locally

Use **Node 24.22.1** (see `.nvmrc`) and **npm 11.19.1**. The supported Node range is 24.12–24.x. Run these commands from the repository root:

```sh
npm ci
npm run db:setup
npm run dev
```

Open [localhost:5173](http://127.0.0.1:5173). The API runs at `http://127.0.0.1:3000`; Vite proxies `/api` to it. The development command watches the web source and recompiles/restarts the API when its source changes.

No environment file is required for the defaults. To customize the API, copy `apps/api/.env.example` to `apps/api/.env`:

| Variable                | Default                | Purpose                                                                                                                           |
| ----------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | `file:./prisma/dev.db` | SQLite database; relative paths resolve from `apps/api`                                                                           |
| `ANTHROPIC_API_KEY`     | unset                  | Turns on Claude's notes on contact messages (summary, language, kind, spam flag, draft reply)                                     |
| `CONTACT_TRIAGE_MODEL`  | `claude-opus-5-5`      | Claude model for those notes                                                                                                      |
| `SLACK_WEBHOOK_CONTACT` | unset                  | Slack incoming webhook (`https://hooks.slack.com/services/…`) that receives contact-form messages                                 |
| `TRUST_PROXY`           | unset                  | Express `trust proxy` setting behind a reverse proxy (e.g. `loopback`), so the contact form's rate limit sees visitors' addresses |
| `HOST`                  | `127.0.0.1`            | API listening address                                                                                                             |
| `PORT`                  | `3000`                 | API port                                                                                                                          |

Vite accepts `WEB_PORT` (default `5173`) and `API_PROXY_TARGET` (default `http://127.0.0.1:3000`) through the shell or `apps/web/.env`. Both ports are strict: choose a free port if another process is using the default.

## Content and assets

- **Current projects:** edit `apps/api/src/content/projects.ts`, then run `npm run db:seed`. This upserts the three known slugs in a transaction, keeps their IDs stable, and preserves unrelated records. It deliberately replaces database edits to those three seeded records with the content file’s values.
- **Profile:** edit `apps/api/src/content/profile.ts`. Development picks up changes automatically; rebuild for production.
- **Publication:** a project appears publicly only when `published` is `true`. New database rows default to unpublished. Public responses exclude IDs, timestamps, internal notes, and editorial fields.
- **Media:** add assets under `apps/web/public/projects`, `story`, or `brand`; use root-relative URLs in content. Projects support a logo, desktop capture, optional mobile capture, alt text, and a caption. Ikitai uses three real app captures with fictional demo plans; its screen list is in `apps/web/src/content/app-screens.ts`.
- **Evidence:** see [content notes](docs/CONTENT_NOTES.md) and [asset sources](docs/ASSETS.md). The original [website brief](docs/WEBSITE_BRIEF.md) and [kickoff prompt](docs/KICKOFF_PROMPT.md) are retained as historical input.
- **Design:** the studio (`/`) and the personal page (`/quentin`) deliberately use two registers of one system. Shared tokens, header and footer are in `apps/web/src/styles/global.css`; the studio is in `home.css` and the personal page in `profile.css`. The design directions and their review are summarised in the [redesign notes](docs/REDESIGN.md).

The studio page is the masthead and tagline, then three tiers of work, each project's `kind` in the database: **products** (cards with the real screen, stage, platforms, languages, stack and a direct link), **experiments** (private side projects, one line each) and **earlier** work (Ownest, Ledgys, CryptoFR). Between them, “How I build” has an interactive Three.js view of every technology used (`StackExplorer.vue`, loaded on demand; without WebGL it is a list): picking one shows the projects that use it. A product card opens the project in a native modal dialog over the page (`ProjectDialog.vue`) at the project's address, so the link can be shared, Back or Escape closes it, and previous/next (in its top bar, with the arrow keys, or by swiping sideways on a phone) step through the products without adding history. Tapping a screenshot opens it full size (`ScreenViewer.vue`), with its own arrows, keys and swipes; Escape closes just the viewer. Opened from a shared link or a refresh, the same address is a server-rendered page with the same content (`ProjectDetail.vue`); only products have one. Each project's `stack` is read from its own repository.

**Say hello** is one contact form (`SayHello.vue`), opened from the navbar and from the footer on every page; on phones it takes the whole screen. On an English page in a browser that prefers Japanese, a small note offers the Japanese version (`LanguageHint.vue`); it never redirects and stays away once dismissed or once a language is picked. `POST /api/contact` validates the message, drops obvious bots (a hidden field and a minimum time on the form), allows five messages an hour per address, saves it in the `ContactMessage` table and forwards it to Slack through `SLACK_WEBHOOK_CONTACT`, retrying with backoff when Slack is unreachable, the way Ikitai delivers feedback. What the sender typed is sent as plain text, so it can't mention anyone in Slack. Without a webhook, messages wait in the database and are delivered once one is set. With `ANTHROPIC_API_KEY`, Claude reads each message first (`contact-triage.ts`, at low effort, with Anthropic's automatic fallback if a request is declined) and the Slack post opens with a one-line summary, the language, the kind of message and a spam flag, followed by a draft reply in the sender's language that the “Reply by email” link fills in. The sender's email address is never sent to Claude, the notes are made once per message, and if Claude is unavailable the message is delivered without them.

**For AI assistants and search engines:** `/llms.txt` is a plain Markdown summary of the site (products, experiments, earlier work, links), written from the same published content as the pages. Indexed pages also carry schema.org JSON-LD: the person and the site, the products on the studio page, the app on each product page, and a profile page on `/quentin`.

**Languages:** English is at the root and Japanese under `/ja` (`/ja/`, `/ja/work/<slug>`, `/ja/quentin`); the header links each page to its other version. Inside the app every path is the English one and the router's base adds `/ja`. Interface text is in `apps/web/src/i18n` (vue-i18n); project text in Japanese is in each project's `translations` field (`apps/api/src/content/projects.ts`, any missing field falls back to English); the personal page's Japanese content is `apps/api/src/content/profile.ja.ts`. The API returns Japanese content with `?lang=ja`. Pages get `<html lang>`, a canonical address in their own language, and `hreflang` links to both versions. Japanese text uses the system's Japanese fonts behind the site's Latin faces.

On first load, `BrandMark.vue` builds the header logo once: the plain hexagon appears, then the rocket flies in from beyond its lower-left edge, carving its trail, and stops where it sits in the logo before the untouched SVG takes over. Reduced motion, later visits, a late script with the logo already on screen, or `?entrance=off` show the original SVG directly. The header uses the mark with a live-text wordmark, because the lockup’s small lettering is hard to read at header size. It is a sticky bar that condenses on scroll, shows the studio name only once the masthead has scrolled away, links to the projects and the personal page, and offers a “Say hello” popover. Clicking the logo on the studio page scrolls to the top and replays the animation; moving between the studio and `/quentin` morphs one header into the other where view transitions are supported.

**Motion.** Every effect below is off with reduced motion, and browsers without the feature get the plain behaviour.

- **Card into window:** opening a product whose card is on screen grows the card into the project window (a view transition from `router.ts`: the card and the window share names for the frame, the screens, the logo and the name, `morphStyle` in `useProjectOverlay.ts`); closing shrinks it back. Opened from elsewhere, the window fades in as before.
- **Products in use:** the web products have a short silent clip (`apps/web/public/projects/<slug>-clip.mp4`, about 330 KB, recorded from the live sites by `node tools/record-clips.mjs`). On a card it plays while the pointer is over it (`CardClip.vue`); on touch screens the card most in view plays, one at a time; nothing loads before it plays, and Save-Data turns it off. In the project window it leads the screens with a pause button (`DetailClip.vue`). The list is in `content/project-screens.ts`; Ikitai needs a screen recording of the app before it can have one.
- **Hexagon field:** behind the studio hero, a faint lattice of the logo's hexagon lights up around a mouse pointer, and one ripple spreads from the logo after its entrance (`HexField.vue`, a canvas, no library). On touch screens it stays still.
- **Language switch:** following the 日本語/English link opens the other language's page at the same place, and the words cross-fade while the layout stays still (a cross-page view transition: `switchLanguage` in `src/i18n` remembers the place, the `pagereveal` script in `index.html` restores it). Other page loads skip the transition.

## Database changes

After editing `apps/api/prisma/schema.prisma`, create and apply a development migration:

```sh
npm run db:migrate:dev -- --name describe_the_change
npm run db:generate
```

Apply committed migrations to an existing database with `npm run db:migrate`. Initialize a new database with `npm run db:setup`, which generates the client, creates the database’s parent directory, applies migrations, and seeds content. Database files, generated Prisma code, build output, local logs, and `.env` files are ignored by Git.

## Checks and production preview

```sh
npm run format:check
npm run typecheck
npm test
npm run build
npm start
```

`npm test` builds the web client and server renderer, builds the API, and runs integration tests against a new temporary database. Tests cover repeatable seeding, publication filtering, public response fields, the contact form (validation, bot filtering, Slack delivery and rate limiting), read-only endpoints, persistence across restarts, server rendering of the studio, project and personal pages, request isolation, hydration-data escaping, and database failure responses. They do not modify the development database.

After `npm run build`, `npm start` serves the API, static assets, and server-rendered pages on port 3000. Stop the development server first, or use a different port:

```sh
PORT=3001 npm start
```

The server compresses text responses and gives Vite’s versioned assets a long immutable cache lifetime. HTML and unversioned public images remain revalidatable so content changes are picked up.

`/`, `/work/<slug>` and `/quentin`, and their `/ja` versions, support direct navigation and refresh. Unknown pages and project slugs return a real 404. Old links to the studio’s former project sections (`/#work-<slug>`) open the project’s page. A database failure returns 503 with a retryable page state; the profile remains available because it is file-based. The public API is:

| Endpoint            | Result                                                             |
| ------------------- | ------------------------------------------------------------------ |
| `GET /api/projects` | Published projects in editorial order (`?lang=ja` for Japanese)    |
| `GET /api/profile`  | Public profile content and source links (`?lang=ja` for Japanese)  |
| `GET /api/health`   | Database readiness, including the content table                    |
| `POST /api/contact` | Contact-form message (`name`, `email`, `message`); 202, 400 or 429 |

## Sharing and eventual hosting

Titles, descriptions, canonical URLs, and Open Graph/Twitter images are generated from `packages/shared/metadata.js`. Every public page has its own 1200 × 630 link preview in each language, in `apps/web/public/social`: the studio page, `/quentin`, and each product with its real screen, name and summary. `node tools/share-cards.mjs` renders them with Chrome from a running server (`npm start`); run it again when a product is added or changes. A product without a preview yet uses the studio page's image. Project pages take their title and description from the project. Pages that don't exist return 404 with `noindex` and no canonical URL. The server builds `/sitemap.xml` from the published products, so a new product appears in it as soon as it is published. Each page has a single address: `/index.html`, `/ja` and addresses ending in `/` redirect permanently to it, and API responses carry `X-Robots-Tag: noindex`. `favicon.ico` and `apple-touch-icon.png` are generated from the brand icon.

The canonical origin is `https://beyondblockchain.com`. This checkout is a **local preview**; hosting, DNS, and deployment have not been configured. A production host will need Node, the built client and server renderer, a persistent writable SQLite path, and backups of that database. Set `DATABASE_URL` to an absolute persistent path, apply migrations before starting, and bind `HOST` appropriately behind the chosen reverse proxy. Do not run the content seed automatically on every restart if production content is also edited in the database.

There is no analytics, account system or wallet connection, and no API that writes content. The only write is the contact form, which stores messages for delivery to Slack.
