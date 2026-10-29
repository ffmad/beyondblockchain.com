import { createApp, createSSRApp } from 'vue';
import { createMemoryHistory, createWebHistory } from 'vue-router';
import type { InitialResources } from '@beyond/shared';
import App from './App.vue';
import { createSiteRouter } from './router';
import { initialResourcesKey } from './composables/useResource';

export function createSiteApp(initialResources?: InitialResources, server = false) {
  const app = initialResources ? createSSRApp(App) : createApp(App);
  const router = createSiteRouter(server ? createMemoryHistory() : createWebHistory());
  app.provide(initialResourcesKey, { ...initialResources });
  app.use(router);
  return { app, router };
}
