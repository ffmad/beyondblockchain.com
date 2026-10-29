# Beyond Blockchain

Quentin de Beauchesne’s project website and personal profile. The homepage features Ikitai, Fairmints (since 2024), and FestCompass; `/quentin` covers previous work, community involvement, writing, and talks.

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

| Variable       | Default                | Purpose                                                 |
| -------------- | ---------------------- | ------------------------------------------------------- |
| `DATABASE_URL` | `file:./prisma/dev.db` | SQLite database; relative paths resolve from `apps/api` |
| `HOST`         | `127.0.0.1`            | API listening address                                   |
| `PORT`         | `3000`                 | API port                                                |

Vite accepts `WEB_PORT` (default `5173`) and `API_PROXY_TARGET` (default `http://127.0.0.1:3000`) through the shell or `apps/web/.env`. Both ports are strict: choose a free port if another process is using the default.

## Content and assets

- **Current projects:** edit `apps/api/src/content/projects.ts`, then run `npm run db:seed`. This upserts the three known slugs in a transaction, keeps their IDs stable, and preserves unrelated records. It deliberately replaces database edits to those three seeded records with the content file’s values.
- **Profile:** edit `apps/api/src/content/profile.ts`. Development picks up changes automatically; rebuild for production.
- **Publication:** a project appears publicly only when `published` is `true`. New database rows default to unpublished. Public responses exclude IDs, timestamps, internal notes, and editorial fields.
- **Media:** add assets under `apps/web/public/projects`, `story`, or `brand`; use root-relative URLs in content. Projects support a logo, desktop capture, optional mobile capture, alt text, and a caption. Ikitai uses three real app captures with fictional demo plans; its screen list is in `apps/web/src/content/app-screens.ts`.
- **Evidence:** see [content notes](docs/CONTENT_NOTES.md) and [asset sources](docs/ASSETS.md). The original [website brief](docs/WEBSITE_BRIEF.md) and [kickoff prompt](docs/KICKOFF_PROMPT.md) are retained as historical input.
- **Design:** the studio (`/`) and the personal page (`/quentin`) deliberately use two registers of one system. Shared tokens, header and footer are in `apps/web/src/styles/global.css`; the studio is in `home.css` and the personal page in `profile.css`. The design directions and their review are summarised in the [redesign notes](docs/REDESIGN.md).

The studio hero uses the original mark as an aperture: selecting a project reveals its real capture along the rocket’s diagonal. `BrandMark.vue` can play a one-time entrance (about 200 tiles assembling the mark in 750 ms) only on a fast first load with the hero on screen; otherwise, with reduced motion, or with `?entrance=off`, the original SVG shows immediately. Project captures open full size in a native dialog that closes with Escape or the backdrop.

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

`npm test` builds the web client and server renderer, builds the API, and runs integration tests against a new temporary database. Tests cover repeatable seeding, publication filtering, public response fields, read-only endpoints, persistence across restarts, server rendering, request isolation, hydration-data escaping, and database failure responses. They do not modify the development database.

After `npm run build`, `npm start` serves the API, static assets, and server-rendered pages on port 3000. Stop the development server first, or use a different port:

```sh
PORT=3001 npm start
```

The server compresses text responses and gives Vite’s versioned assets a long immutable cache lifetime. HTML and unversioned public images remain revalidatable so content changes are picked up.

Both `/` and `/quentin` support direct navigation and refresh. Unknown page routes return a real 404. A database failure returns 503 with a retryable page state; the profile remains available because it is file-based. The public API is:

| Endpoint            | Result                                          |
| ------------------- | ----------------------------------------------- |
| `GET /api/projects` | Published projects in editorial order           |
| `GET /api/profile`  | Public profile content and source links         |
| `GET /api/health`   | Database readiness, including the content table |

## Sharing and eventual hosting

Titles, descriptions, canonical URLs, and Open Graph/Twitter images are generated from `packages/shared/metadata.js`. The two 1200 × 630 sharing images are in `apps/web/public/social`. Their editable HTML source is `tools/share-card.html`; Vite can serve that file through its local `/@fs/` URL for a browser capture. The sitemap contains the two public pages.

The canonical origin is `https://beyondblockchain.com`. This checkout is a **local preview**; hosting, DNS, and deployment have not been configured. A production host will need Node, the built client and server renderer, a persistent writable SQLite path, and backups of that database. Set `DATABASE_URL` to an absolute persistent path, apply migrations before starting, and bind `HOST` appropriately behind the chosen reverse proxy. Do not run the content seed automatically on every restart if production content is also edited in the database.

There is no analytics, account system, wallet connection, contact form, or unauthenticated content-write API. Contact links use the supplied public social profiles.
