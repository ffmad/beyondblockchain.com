import { createApp, createSSRApp, ref } from 'vue';
import { createMemoryHistory, createWebHistory } from 'vue-router';
import type { InitialResources } from '@beyond/shared';
import App from './App.vue';
import { createSiteRouter } from './router';
import { initialResourcesKey } from './composables/useResource';
import { createProjectDirectory, projectDirectoryKey } from './composables/useProjectDirectory';
import { projectOverlayKey } from './composables/useProjectOverlay';
import { createSiteI18n, type Locale } from './i18n';

export function createSiteApp(
  initialResources?: InitialResources,
  server = false,
  locale: Locale = 'en',
) {
  const app = initialResources ? createSSRApp(App) : createApp(App);
  const directory = createProjectDirectory(initialResources, locale);
  // Japanese pages live under /ja: the router's base adds the prefix to every address.
  const base = locale === 'ja' ? '/ja' : undefined;
  const overlay = ref(false);
  const router = createSiteRouter(
    server ? createMemoryHistory(base) : createWebHistory(base),
    directory,
    overlay,
    locale,
  );
  app.provide(initialResourcesKey, { ...initialResources });
  app.provide(projectDirectoryKey, directory);
  app.provide(projectOverlayKey, overlay);
  app.use(createSiteI18n(locale));
  app.use(router);
  return { app, router };
}
