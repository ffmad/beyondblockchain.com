# Beyond Blockchain

The website of Beyond Blockchain, Quentin de Beauchesne’s studio in Tokyo: [beyondblockchain.com](https://beyondblockchain.com). It shows the studio’s products, work in progress and other projects, with an About page, in English and Japanese.

## Stack

- **Web:** Vue 3, TypeScript and Vite, rendered on the server and hydrated in the browser. English is at `/`, Japanese under `/ja`.
- **API:** NestJS, with Prisma and SQLite.
- **Assistant:** a small multilingual sentence model, run on the server, matches visitors’ questions to a written knowledge base and answers with its facts. It never writes text of its own.

## Run locally

Use Node 24 (see `.nvmrc`). From the repository root:

```sh
npm ci
npm run db:setup
npm run dev
```

Then open [127.0.0.1:5173](http://127.0.0.1:5173). Settings are optional; `apps/api/.env.example` lists them.

## Repository

| Path              | What it holds                                                                          |
| ----------------- | -------------------------------------------------------------------------------------- |
| `apps/web`        | The Vue app: pages, components, styles and interface text (`src/i18n`)                 |
| `apps/api`        | The NestJS API and server rendering, the Prisma schema and the site’s content          |
| `packages/shared` | Types and page metadata shared by both                                                 |
| `tools`           | Scripts that record the project clips, render the link previews and test the assistant |

Projects, the profile and the assistant’s knowledge are typed files in `apps/api/src/content`, in both languages. After editing the projects, run `npm run db:seed`.

## Checks

```sh
npm run format:check
npm run typecheck
npm test
```

`npm test` builds everything and runs the integration tests against a temporary database. For a production build, run `npm run build`, then `npm start`.

## Credits

Logos and images from other sites, and where each one comes from, are listed in [docs/ASSETS.md](docs/ASSETS.md).
