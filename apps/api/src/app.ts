import 'reflect-metadata';
import {
  Controller,
  Get,
  Header,
  Module,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Prisma } from './generated/prisma/client.js';
import type { InitialResources, Project } from '@beyond/shared';
import {
  contentPath,
  localeFromPath,
  localizedPath,
  metadataTags,
  stripLocale,
  workSlug,
  type Locale,
} from '@beyond/shared/metadata.js';
import express from 'express';
import compression from 'compression';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Database } from './database.js';
import { profile } from './content/profile.js';
import { profileJa } from './content/profile.ja.js';
import { ContactController, ContactService } from './contact.js';
import { AssistantController, AssistantService } from './assistant.js';
import { llmsText } from './llms.js';
import { sitemapXml } from './sitemap.js';

const publicProjectFields = {
  slug: true,
  name: true,
  summary: true,
  description: true,
  audience: true,
  url: true,
  category: true,
  role: true,
  startedYear: true,
  status: true,
  featured: true,
  logoUrl: true,
  imageUrl: true,
  mobileImageUrl: true,
  imageAlt: true,
  imageCaption: true,
  stack: true,
  kind: true,
  stage: true,
  market: true,
  platforms: true,
  languages: true,
  endedYear: true,
} satisfies Prisma.ProjectSelect;

/** The language a request asks for with `?lang=`; anything unknown is English. */
const requestLocale = (lang: unknown): Locale => (lang === 'ja' ? 'ja' : 'en');
const localizedFields = [
  'summary',
  'description',
  'audience',
  'category',
  'role',
  'imageAlt',
  'imageCaption',
] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
// JSON lists are stored as JSON; anything that isn't a list of strings is left out.
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const kinds = ['product', 'experiment', 'earlier'] as const;
const stages = ['live', 'review', 'beta', 'soon'] as const;
const markets = ['japan'] as const;
const oneOf = <T extends string>(options: readonly T[], value: unknown) =>
  options.find((option) => option === value);

async function readPublicProjects(database: Database, locale: Locale = 'en'): Promise<Project[]> {
  const rows = await database.client.project.findMany({
    where: { published: true },
    orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }],
    select: { ...publicProjectFields, translations: true },
  });
  return rows.map(({ translations, ...row }) => {
    // Translated text replaces the English field by field; missing or malformed entries keep the English.
    const text =
      isRecord(translations) && isRecord(translations[locale]) ? translations[locale] : {};
    const localized = Object.fromEntries(
      localizedFields.filter((field) => typeof text[field] === 'string').map((f) => [f, text[f]]),
    );
    return {
      ...row,
      ...localized,
      stack: strings(row.stack),
      platforms: strings(row.platforms),
      languages: strings(row.languages),
      kind: oneOf(kinds, row.kind) ?? 'product',
      stage: oneOf(stages, row.stage) ?? null,
      market: oneOf(markets, row.market) ?? null,
    };
  });
}

@Controller('api')
class PublicController {
  constructor(private readonly database: Database) {}

  @Get('projects')
  async projects(@Query('lang') lang?: string): Promise<Project[]> {
    try {
      return await readPublicProjects(this.database, requestLocale(lang));
    } catch {
      throw new ServiceUnavailableException('Projects are temporarily unavailable.');
    }
  }

  @Get('profile')
  profile(@Query('lang') lang?: string) {
    return requestLocale(lang) === 'ja' ? profileJa : profile;
  }

  @Get('health')
  async health() {
    try {
      // Check the content table as well as connectivity, so missing migrations fail readiness.
      await this.database.client.project.count();
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('The content database is unavailable.');
    }
  }
}

// A plain summary of the site for AI assistants (llmstxt.org), from the same content as the pages.
@Controller()
class LlmsController {
  constructor(private readonly database: Database) {}

  @Get('llms.txt')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  async llms() {
    try {
      return llmsText(await readPublicProjects(this.database), profile);
    } catch {
      throw new ServiceUnavailableException('The site summary is temporarily unavailable.');
    }
  }
}

// Every public page for search engines, in both languages, from the published projects.
@Controller()
class SitemapController {
  constructor(private readonly database: Database) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  async sitemap() {
    try {
      return sitemapXml(await readPublicProjects(this.database));
    } catch {
      throw new ServiceUnavailableException('The sitemap is temporarily unavailable.');
    }
  }
}

@Module({
  controllers: [
    PublicController,
    ContactController,
    AssistantController,
    LlmsController,
    SitemapController,
  ],
  providers: [Database, ContactService, AssistantService],
})
class AppModule {}

export async function createApp({ serveWeb = true, logger = true } = {}) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger ? ['error', 'warn', 'log'] : false,
  });
  app.disable('x-powered-by');
  // Behind a reverse proxy, TRUST_PROXY (e.g. "loopback") lets the contact form's rate limit see visitors' addresses.
  if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY);
  app.use(compression());
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // The pages carry the content; the JSON behind them stays out of search results.
    if (req.path.startsWith('/api/')) res.setHeader('X-Robots-Tag', 'noindex');
    next();
  });

  const webRoot = fileURLToPath(new URL('../../web/dist/', import.meta.url));
  const indexFile = `${webRoot}index.html`;
  if (serveWeb && existsSync(indexFile)) {
    const index = readFileSync(indexFile, 'utf8');
    const serverEntry = new URL('../../web/dist-server/entry-server.js', import.meta.url);
    const render:
      ((url: string, resources: InitialResources, locale: Locale) => Promise<string>) | undefined =
      existsSync(serverEntry) ? (await import(serverEntry.href)).render : undefined;
    const database = app.get(Database);
    // Each page has one address: /index.html, /ja and trailing slashes redirect to it, keeping the query.
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      const page =
        req.path === '/index.html'
          ? '/'
          : /^\/(?!api(?:\/|$)|assets(?:\/|$))[^.]*$/.test(req.path)
            ? localizedPath(
                stripLocale(req.path).replace(/\/$/, '') || '/',
                localeFromPath(req.path),
              )
            : req.path;
      if (page === req.path) return next();
      const query = req.originalUrl.indexOf('?');
      res.redirect(301, page + (query === -1 ? '' : req.originalUrl.slice(query)));
    });
    app.use(
      express.static(webRoot, {
        index: false,
        redirect: false,
        setHeaders(res, path) {
          if (path.startsWith(`${webRoot}assets/`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      }),
    );
    // API and asset misses keep their normal 404 responses. Page misses render the 404 view.
    app
      .getHttpAdapter()
      .getInstance()
      .get(
        /^\/(?!api(?:\/|$)|assets(?:\/|$)).*/,
        async (req: express.Request, res: express.Response, next: express.NextFunction) => {
          if (/\.[^/]+$/.test(req.path)) {
            next();
            return;
          }
          // Japanese pages live under /ja; the app itself sees the address without the prefix.
          const locale = localeFromPath(req.path);
          const path = stripLocale(req.path).replace(/\/$/, '') || '/';
          const appUrl = req.originalUrl.slice(locale === 'ja' ? 3 : 0).replace(/^(?!\/)/, '/');
          const slug = workSlug(path);
          const resources: InitialResources = {};
          let projects: Project[] | null = null;
          let status = path === '/' || path === '/quentin' ? 200 : 404;
          // The studio page and each project's own page (/work/<slug>) render from the published projects.
          if (path === '/' || slug) {
            try {
              projects = await readPublicProjects(database, locale);
              resources[contentPath('/api/projects', locale)] = { data: projects, error: false };
              // Only products have a page of their own.
              if (slug && projects.some((p) => p.slug === slug && p.kind === 'product'))
                status = 200;
            } catch {
              resources[contentPath('/api/projects', locale)] = { data: null, error: true };
              status = 503;
            }
          } else if (path === '/quentin') {
            resources[contentPath('/api/profile', locale)] = {
              data: locale === 'ja' ? profileJa : profile,
              error: false,
            };
          }
          try {
            const html = render ? await render(appUrl, resources, locale) : '';
            // Escaping '<' prevents content from closing the JSON script element.
            const state = JSON.stringify(resources).replaceAll('<', '\\u003c');
            const document = index
              .replace('<html lang="en">', `<html lang="${locale}">`)
              .replace(
                /<!-- page-meta:start -->[\s\S]*?<!-- page-meta:end -->/,
                metadataTags(path, projects, locale, (image) => existsSync(join(webRoot, image))),
              )
              .replace('<!-- app-html -->', html)
              .replace(
                '<!-- app-state -->',
                render
                  ? `<script id="initial-resources" type="application/json">${state}</script>`
                  : '',
              );
            res.setHeader('Cache-Control', 'no-cache');
            if (status === 503) res.setHeader('Retry-After', '60');
            res.status(status).type('html').send(document);
          } catch {
            res
              .status(503)
              .type('text')
              .send('The page is temporarily unavailable. Please try again.');
          }
        },
      );
  }
  app.enableShutdownHooks();
  return app;
}
