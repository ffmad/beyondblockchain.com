import { createRouter, type RouterHistory } from 'vue-router';
import { metadataFor, siteOrigin } from '@beyond/shared/metadata.js';
import ProjectsPage from './pages/ProjectsPage.vue';
import QuentinPage from './pages/QuentinPage.vue';
import NotFoundPage from './pages/NotFoundPage.vue';

export function createSiteRouter(history: RouterHistory) {
  const router = createRouter({
    history,
    routes: [
      { path: '/', component: ProjectsPage },
      { path: '/quentin', component: QuentinPage },
      { path: '/:pathMatch(.*)*', component: NotFoundPage },
    ],
    scrollBehavior(to, _from, saved) {
      if (saved) return saved;
      if (to.hash) {
        let id: string;
        try {
          id = decodeURIComponent(to.hash.slice(1));
        } catch {
          return false;
        }
        const element = document.getElementById(id);
        return element ? { el: element, top: 0 } : false;
      }
      return { top: 0 };
    },
  });

  router.afterEach((to) => {
    if (typeof document === 'undefined') return;
    const path = to.path.replace(/\/$/, '') || '/';
    const meta = metadataFor(path);
    document.title = meta.title;
    const values: Record<string, string> = {
      'meta[name="description"]': meta.description,
      'meta[name="robots"]':
        path === '/' || path === '/quentin' ? 'index,follow' : 'noindex,follow',
      'meta[property="og:title"]': meta.title,
      'meta[property="og:description"]': meta.description,
      'meta[property="og:url"]': siteOrigin + path,
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
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', siteOrigin + path);
  });
  return router;
}
