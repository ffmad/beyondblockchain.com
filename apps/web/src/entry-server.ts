import { renderToString } from 'vue/server-renderer';
import type { InitialResources } from '@beyond/shared';
import type { Locale } from '@beyond/shared/metadata.js';
import { createSiteApp } from './app';

/** Renders a page; `url` is the address without its language prefix. */
export async function render(url: string, resources: InitialResources, locale: Locale = 'en') {
  const { app, router } = createSiteApp(resources, true, locale);
  await router.push(url);
  await router.isReady();
  return renderToString(app);
}
