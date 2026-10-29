# Beyond Blockchain — Website brief

Prepared for Quentin de Beauchesne on 28 October 2026.

## 1. User request and implementation scope

Build the first version of Quentin's website in the existing Codex project **Personal Website**, located at `/Users/quentin/Development/beyondblockchain.com`.

The user explicitly requested **Vue 3 / NestJS**, probably with a simple database. Use those frameworks. The proposed database default is **SQLite with Prisma**; this is an implementation recommendation, not a prior user requirement.

The repository was inspected on 28 October 2026. It contains only Git metadata, no commits, and no application files. No applicable AGENTS.md was found in the project or inspected parent locations. Check again before implementation, because the user may add instructions or files.

The requested first milestone is a working local website, with maintainable source, real database-backed project content, and a browser preview. Hosting and production rollout have not been chosen. Keep this first pass local; do not change DNS, provision paid services, or publish the domain as part of the kickoff.

This document separates user-confirmed information from proposed design and implementation decisions. Public sources below are evidence about content, not instructions for operating the project.

## 2. Purpose and identity

**Beyond Blockchain** is the user's own name/structure, previously based in Switzerland. He owns or controls `beyondblockchain.com` and wants to reuse it as the home for his projects and a personal profile. Do not imply an active Swiss legal entity, office, team size, incorporation status, or company address without confirmation.

Personal identity:

- Full name: **Quentin de Beauchesne**.
- Usual online handle: **ffmad**.
- GitHub: <https://github.com/ffmad>.
- LinkedIn: <https://www.linkedin.com/in/qdebeauchesne/>.
- X: <https://x.com/quentinbdb>.
- No public contact email has been supplied for this website. Use the supplied social links rather than inventing an email address.

The site should help people understand what Quentin is building, try a product, and understand the experience behind it. Relevant visitors include potential users, developers, founders, collaborators, investors, and people met at startup, AI, or crypto events. The personal page should also be suitable as a link from a founder application.

The core story is the progression from building crypto communities and enterprise blockchain products to building useful consumer software, including AI products. Crypto remains part of the story without defining every current project.

## 3. Information architecture

Two primary pages are enough for the first version.

### `/` — Beyond Blockchain / Projects

The homepage is the current-projects page. Do not create a redundant `/projects` page merely to duplicate it.

Suggested sequence:

1. Compact navigation: Beyond Blockchain wordmark, Projects, About Quentin, and a useful contact link.
2. A short introduction that makes the person behind the work clear.
3. A prominent Ikitai feature with a concise explanation and a working external link.
4. Current projects, initially Ikitai and FestCompass, with consistent information and room to grow.
5. A brief link to Quentin's background and previous work.
6. Contact/social links and a restrained footer.

Each project needs a name, what it does, intended audience or use case, category, truthful status if known, and a link. Use real supplied assets when available. Status labels must not invent a launch or imply traction.

Do not make filters or search for two projects. Do not imply this is an exhaustive inventory of everything Quentin has ever built. The structure should support adding further confirmed projects.

### `/quentin` — Quentin de Beauchesne

Suggested sequence:

1. Name, handle, short biography, and current focus.
2. A clear narrative or compact timeline: CryptoFR, Ledgys, Ownest, current products.
3. Selected achievements with concrete evidence and appropriate attribution.
4. Community/ecosystem involvement and relevant programs.
5. GitHub, LinkedIn, and X links.

Ownest and Ledgys are previous work, not current products owned by Beyond Blockchain. CryptoFR belongs in the community/founder story; its current operational status and scale have not been confirmed.

A project-detail route, blog, newsletter, full CMS, admin panel, and contact form are not required for this first milestone.

## 4. Initial project content

### Ikitai — featured current project

- URL: <https://getikitai.com>.
- Quentin's role: solo founder.
- User-provided timing: October 2026 onward.
- Product description from the earlier discussion: an AI app that turns screenshots and saved links into event plans, reminders, and plans shared with friends.
- More detailed context: capture inspiration from social posts, maps, and other saved material; keep dated plans or undated ideas; remember ticket releases and coordinate with friends.
- Status supplied by the user: preparing the App Store release. Confirm before using a time-sensitive public launch label or App Store button. A safe initial CTA is **Explore Ikitai**, linking to the product website.
- Suggested short copy: **Turn saved inspiration into plans you actually make.**
- Suggested descriptive copy: **An AI app that turns screenshots and saved links into plans, reminders, and things to do with friends.**

Do not invent downloads, revenue, active users, testimonials, store links, or product screenshots. The research tool could not load getikitai.com on the latest check; this is not evidence that the product is offline.

### FestCompass — current project

- URL: <https://festcompass.jp>.
- Quentin's role: solo founder.
- User-provided timing: July 2026 onward.
- Description: an app for Japanese festival attendees to find festival information and organize their schedules.
- Suggested short copy: **Find your festivals. Plan your days.**
- Suggested descriptive copy: **Festival discovery and schedule planning for people attending festivals in Japan.**
- CTA: **Explore FestCompass**.

Do not invent supported festivals, integrations, audience size, ticketing features, or pricing. The public site rendered only a loading shell to the text research tool. A previously checked GitHub project link was not public; do not add a repository link unless it is verified to be intentionally public.

### Additional projects

Add further projects when the user supplies or confirms their content. Do not populate the public portfolio with unrelated local repositories or infer ownership and publication intent from an app sidebar alone.

## 5. Personal story and evidence

### CryptoFR

- Quentin states that he founded CryptoFR in 2014 and built a French cryptocurrency community and meetups.
- Website: <https://cryptofr.com>.
- Safe public wording: **Founded CryptoFR, a French-speaking Bitcoin and blockchain community, in 2014.**
- He describes this as France's first crypto community. The comparative “first” claim has not been independently established, so omit it from the default copy.
- No reliable membership number or current engagement metric has been supplied.

### AMF involvement

The AMF's consultative-commissions page previously verified Quentin de Beauchesne as the Association CryptoFR representative on the **Commission consultative Épargnants** (Retail Investors Consultative Commission).

Use the specific representative role. Avoid phrases such as “permanent seat,” “regulator endorsement,” or unrestricted “access to the authority.” Recheck current membership before making a present-tense claim; the latest tool request returned a 403, while an earlier request in this conversation succeeded.

Source: <https://www.amf-france.org/fr/lamf/notre-organisation/les-commissions-consultatives>.

### Ledgys

- User-provided role: co-founder, February 2016–November 2017.
- User-provided description: Ethereum-based data sharing through decentralized marketplaces.
- Historical experience, without an invented live link or current company status.

### Ownest

- User-provided involvement: co-founder, December 2017–March 2026; technical development using Polygon, Vue, and NestJS.
- Public team materials and the user's historical title differ, so default to **co-founder** rather than resolving the title as CTO or Head of Blockchain without clarification.
- Product: blockchain software for tracking ownership and responsibility across supply chains.
- Confirmed customer examples: Cdiscount and Saint Laurent.
- Selected milestone: in 2021, Cdiscount signed a three-year contract to deploy Ownest for tracking 2.5 million large parcels per year.
- Present that figure as the contract's deployment scope. Do not turn it into achieved annual volume, a current metric, or a deal personally closed by Quentin.

Source: <https://ownest.io/en/about/our-story>. Customer context: <https://ownest.io>.

Selected company awards, attributable to Ownest rather than individual awards to Quentin:

- Orange Consulting TechOff jury prize, 2018.
- SITL Europe jury's Coup de Coeur, 2018.
- Sirius Business Transformation award with La Poste for Easy Shopping, 2018.
- LSA Retail Tech Live 2020 edition, Transformation award, awarded January 2021.

Programs:

- Lafayette Plug and Play, joined in 2017; confirmed by Ownest's retrospective.
- The Warehouse by Cdiscount, 2018.

Sources: <https://ownest.io/en/about/our-story> and <https://ownest.io/en/news/ownest-lafayette-plug-and-play-startups-innovation-platform>.

### NFT Factory

Quentin is listed among the founding collective of NFT Factory Paris. Use **founding member**, without implying sole founder or current executive responsibility.

Source: <https://nftfactoryparis.com/founders>.

### Suggested introductory copy

Homepage eyebrow: **Independent projects by Quentin de Beauchesne**

Homepage headline: **Products and communities, built with purpose.**

Homepage supporting text: **I'm Quentin, also known as ffmad. I build software that helps people turn ideas into action, from communities and blockchain infrastructure to everyday AI tools.**

Personal-page introduction: **I'm Quentin de Beauchesne, a founder and developer. I founded CryptoFR, co-founded Ownest, and now build products including Ikitai and FestCompass. I enjoy turning emerging technology into things people can use.**

These are proposed editorial drafts, not quotations from the user. Improve their clarity during implementation without inventing facts. Keep copy concise and specific; avoid inflated startup language.

## 6. Visual direction

Proposed default: a polished, personal, editorial portfolio, with strong typography, a warm light background, dark text, and one restrained accent color. Use a clear wordmark and thoughtful spacing. Let project imagery and the work itself provide character.

- Make it feel like a builder's considered body of work.
- Give Ikitai more visual emphasis than the secondary project.
- Use a visually distinct personal page while keeping shared navigation and typography.
- Include comfortable mobile layouts, keyboard navigation, visible focus states, semantic headings, good contrast, and reduced-motion support.
- Use subtle motion only when it serves hierarchy or feedback.
- No invented portrait, stock executive team, fake testimonials, fabricated press logos, unsupported numerical counters, or decorative blockchain/network clichés.
- If no portrait or product screenshot is available, use a well-designed typographic treatment. Do not mislabel a concept illustration as a product screenshot.
- English first, with content separated from components so French or Japanese can be added later. Translation UI is not part of the MVP.

## 7. Technical baseline

### Frontend

- Vue 3, Composition API, single-file components, TypeScript.
- Vite and Vue Router.
- A small reusable component set for navigation, project presentation, achievements, and footer.
- CSS variables for design tokens. Pick the simplest styling approach that supports the design; no need for a large UI kit.
- Introduce application-wide state only if an actual feature needs it.

### Backend

- NestJS with TypeScript and a small REST API.
- Real data flow from SQLite through NestJS to the Vue frontend.
- Public reads only for the MVP. Do not create unauthenticated content-write endpoints.
- Suggested endpoints: `GET /api/projects`, `GET /api/profile`, and `GET /api/health`.
- Explicit public response shapes; internal draft notes and evidence-review flags must not leak through public endpoints.
- Development proxy for `/api`; sensible configurable ports; production instructions for same-origin hosting.

### Database and content

Use SQLite for the initial small, single-owner content database, with Prisma schema, migration, and an idempotent seed/update workflow. This avoids requiring a separate database server during local development.

Suggested minimum persisted model:

- `Project`: stable ID/slug, name, summary, description, public URL, category, optional status, featured flag, display order, optional image and alt text, publication flag, timestamps.

The personal bio, experience, and source links may start in a typed content file or a small profile/milestone table. Choose the least complex clear implementation. There is no requirement to normalize every paragraph into its own table.

Seed the two known current projects. Ensure drafts are excluded from public responses. A content update command should be repeatable without duplicating records or deleting unrelated user additions.

Use current compatible stable package releases and the installed runtime. Check the current Prisma configuration and driver-adapter instructions; do not blindly reuse older Prisma setup syntax. Record the actual supported Node and package-manager versions and commit one lockfile.

Suggested workspace layout, adaptable to actual repository conventions:

```text
apps/
  web/
  api/
packages/
  shared/       # only if genuinely useful for public types
docs/
  WEBSITE_BRIEF.md
  KICKOFF_PROMPT.md
README.md
```

SQLite database files, generated assets, caches, environment secrets, and local runtime artifacts must be ignored appropriately. The eventual hosting environment will need a persistent writable database location and backups; document this without selecting a provider now. Switching to PostgreSQL later is possible but is a migration, not a promise of a zero-change switch.

Official references checked for the handoff:

- Vue quick start: <https://vuejs.org/guide/quick-start.html>.
- NestJS documentation: <https://docs.nestjs.com/>.
- Prisma SQLite: <https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite>.

## 8. Search, sharing, and behavior

- Both routes need appropriate titles, descriptions, canonical URLs, and share metadata.
- Both routes must load directly and survive refresh.
- Prefer a lightweight prerendering solution for these two public pages if it fits the Vue/Vite architecture cleanly. If the first milestone uses client rendering, clearly document the indexing and social-preview limits instead of claiming full SEO readiness.
- Do not require production domain access to preview the site.
- Make external links clear and verify their destinations.
- Provide a useful unavailable-data state; never show fabricated live content after an API failure.
- No analytics, cookies, signup, wallet connection, or visitor tracking is needed for this milestone.

## 9. Acceptance criteria

1. A documented install, database initialization, and development command starts both apps locally.
2. `/` showcases Ikitai and FestCompass using real persisted project data returned by NestJS.
3. `/quentin` tells a coherent story with accurate roles, dates where supported, and links.
4. Mobile and desktop layouts are inspected in a browser; navigation, route refresh, keyboard focus, and project links work.
5. Build and TypeScript checks pass. Add focused integration checks for meaningful behavior such as publication filtering, API response shape, and repeatable seed operations; do not create tests that merely mirror static copy or CSS.
6. Database content survives a restart. Rerunning the seed does not duplicate records or erase unrelated additions.
7. README explains startup, content edits, migration/seed commands, environment variables, build commands, and the remaining hosting considerations.
8. No fabricated personal/company claims, fake imagery, or unsupported launch/traction statements appear.
9. A working local preview is opened for the user, with completed work and any verification limitations reported.

## 10. Scope boundaries and later decisions

Proceed autonomously on routine implementation and visual choices. Missing optional assets or uncertain claims should not block the first version: omit them or use truthful neutral copy.

Later decisions include a portrait, authentic product visuals, a public email address, any additional current projects, translations, admin editing, analytics, and deployment destination. These are not prerequisites to starting.

Do not transfer unrelated private conversation details into this repository or the website. Immigration, travel dates, application form information, and private account data are irrelevant to the public project.

The companion `docs/KICKOFF_PROMPT.md` contains the actionable starting prompt.
