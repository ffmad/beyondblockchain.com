import type { Project } from '@beyond/shared';
import { defaultLocale, locales, pageUrls } from '@beyond/shared/metadata.js';

// /sitemap.xml: every public page in every language, each with its language versions, written from the published
// projects so a new product is listed as soon as it is published.

const escape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function sitemapXml(projects: Project[]) {
  const paths = [
    '/',
    '/quentin',
    '/privacy',
    ...projects.filter((p) => p.kind === 'product').map((p) => `/work/${p.slug}`),
  ];
  const entries = paths.flatMap((path) => {
    const { alternates } = pageUrls(path);
    const links = [
      ...locales.map((locale) => [locale, alternates[locale]]),
      ['x-default', alternates[defaultLocale]],
    ]
      .map(
        ([hreflang, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escape(href)}"/>`,
      )
      .join('\n');
    return locales.map(
      (locale) => `  <url>\n    <loc>${escape(alternates[locale])}</loc>\n${links}\n  </url>`,
    );
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}
