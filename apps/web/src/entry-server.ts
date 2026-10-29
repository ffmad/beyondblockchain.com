import { renderToString } from 'vue/server-renderer';
import type { InitialResources } from '@beyond/shared';
import { createSiteApp } from './app';

export async function render(url: string, resources: InitialResources) {
  const { app, router } = createSiteApp(resources, true);
  await router.push(url);
  await router.isReady();
  return renderToString(app);
}
