import 'reflect-metadata';
import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Prisma } from './generated/prisma/client.js';
import type { InitialResources, Project } from '@beyond/shared';
import { metadataTags } from '@beyond/shared/metadata.js';
import express from 'express';
import compression from 'compression';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Database } from './database.js';
import { profile } from './content/profile.js';

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
} satisfies Prisma.ProjectSelect;

function readPublicProjects(database: Database) {
  return database.client.project.findMany({
    where: { published: true },
    orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }],
    select: publicProjectFields,
  });
}

@Controller('api')
class PublicController {
  constructor(private readonly database: Database) {}

  @Get('projects')
  async projects(): Promise<Project[]> {
    try {
      return await readPublicProjects(this.database);
    } catch {
      throw new ServiceUnavailableException('Projects are temporarily unavailable.');
    }
  }

  @Get('profile')
  profile() {
    return profile;
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

@Module({ controllers: [PublicController], providers: [Database] })
class AppModule {}

export async function createApp({ serveWeb = true, logger = true } = {}) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger ? ['error', 'warn', 'log'] : false,
  });
  app.disable('x-powered-by');
  app.use(compression());
  app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  const webRoot = fileURLToPath(new URL('../../web/dist/', import.meta.url));
  const indexFile = `${webRoot}index.html`;
  if (serveWeb && existsSync(indexFile)) {
    const index = readFileSync(indexFile, 'utf8');
    const serverEntry = new URL('../../web/dist-server/entry-server.js', import.meta.url);
    const render: ((url: string, resources: InitialResources) => Promise<string>) | undefined =
      existsSync(serverEntry) ? (await import(serverEntry.href)).render : undefined;
    const database = app.get(Database);
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
          const path = req.path.replace(/\/$/, '') || '/';
          const resources: InitialResources = {};
          let status = path === '/' || path === '/quentin' ? 200 : 404;
          if (path === '/') {
            try {
              resources['/api/projects'] = {
                data: await readPublicProjects(database),
                error: false,
              };
            } catch {
              resources['/api/projects'] = { data: null, error: true };
              status = 503;
            }
          } else if (path === '/quentin') {
            resources['/api/profile'] = { data: profile, error: false };
          }
          try {
            const html = render ? await render(req.originalUrl, resources) : '';
            // Escaping '<' prevents content from closing the JSON script element.
            const state = JSON.stringify(resources).replaceAll('<', '\\u003c');
            const document = index
              .replace(/<!-- page-meta:start -->[\s\S]*?<!-- page-meta:end -->/, metadataTags(path))
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
