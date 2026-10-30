import type { Project } from '@beyond/shared';
import { metadataFor, pageUrls, siteOrigin, type Locale } from '@beyond/shared/metadata.js';

/** Keeps the title, description, canonical, language and share tags in step with client-side navigation. */
export function applyPageMetadata(
  appPath: string,
  projects: readonly Project[] | null,
  locale: Locale,
) {
  const path = appPath.replace(/\/$/, '') || '/';
  const meta = metadataFor(path, projects, locale);
  const { canonical, alternates } = pageUrls(path, locale);
  document.title = meta.title;
  const values: Record<string, string> = {
    'meta[name="description"]': meta.description,
    'meta[name="robots"]': meta.indexed ? 'index,follow' : 'noindex,follow',
    'meta[property="og:title"]': meta.title,
    'meta[property="og:description"]': meta.description,
    'meta[property="og:url"]': canonical,
    'meta[property="og:type"]': path === '/quentin' ? 'profile' : 'website',
    'meta[property="og:image"]': siteOrigin + meta.image,
    'meta[property="og:image:alt"]': meta.imageAlt,
    'meta[name="twitter:title"]': meta.title,
    'meta[name="twitter:description"]': meta.description,
    'meta[name="twitter:image"]': siteOrigin + meta.image,
    'meta[name="twitter:image:alt"]': meta.imageAlt,
  };
  for (const [selector, value] of Object.entries(values))
    document.querySelector(selector)?.setAttribute('content', value);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  for (const [language, url] of Object.entries(alternates))
    document.querySelector(`link[hreflang="${language}"]`)?.setAttribute('href', url);
  document.querySelector('link[hreflang="x-default"]')?.setAttribute('href', alternates.en);
}
