import { nextTick, type Ref, type ShallowRef } from 'vue';
import { createRouter, START_LOCATION, type RouterHistory } from 'vue-router';
import type { Project } from '@beyond/shared';
import type { Locale } from '@beyond/shared/metadata.js';
import { applyPageMetadata } from './page-metadata';
import { cardOnScreen, isOverStudio, morphing } from './composables/useProjectOverlay';
import ProjectsPage from './pages/ProjectsPage.vue';
import WorkPage from './pages/WorkPage.vue';
import QuentinPage from './pages/QuentinPage.vue';
import NotFoundPage from './pages/NotFoundPage.vue';

export function createSiteRouter(
  history: RouterHistory,
  directory: ShallowRef<Project[] | null>,
  overlay: Ref<boolean>,
  locale: Locale,
) {
  const router = createRouter({
    history,
    routes: [
      { path: '/', component: ProjectsPage },
      { path: '/work/:slug', name: 'work', component: WorkPage },
      { path: '/quentin', component: QuentinPage },
      { path: '/:pathMatch(.*)*', component: NotFoundPage },
    ],
    // New pages open at the top and Back returns to the same place, both at once rather than smoothly.
    // A project opened over the studio page leaves the page where it is.
    scrollBehavior(to, from, saved) {
      // A page that has just loaded stays where the browser put it (the top, its #anchor, or the place kept
      // across a language switch).
      if (from === START_LOCATION) return saved ? { ...saved, behavior: 'instant' } : false;
      if (to.name === 'work' && from.matched.length && isOverStudio()) return false;
      if (saved) return { ...saved, behavior: 'instant' };
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
      return { top: 0, behavior: 'instant' };
    },
  });

  // Moving between the studio and /quentin morphs one header into the other: the studio's mark flies to its
  // place in the personal header and the names swap. Opening a product from its card on screen grows the card
  // into the project window, and closing shrinks it back. Browsers without view transitions just navigate.
  let finishTransition: (() => void) | undefined;
  let morphs = 0;
  router.beforeResolve(async (to, from) => {
    if (typeof document === 'undefined' || !document.startViewTransition) return;
    if (!from.matched.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const crossing = (to.path === '/quentin') !== (from.path === '/quentin');
    const product =
      from.path === '/' && to.name === 'work'
        ? String(to.params.slug)
        : from.name === 'work' && overlay.value && to.path === '/'
          ? String(from.params.slug)
          : null;
    const morph = product && cardOnScreen(product) ? product : null;
    if (!crossing && !morph) return;
    const run = ++morphs;
    if (morph) {
      morphing.value = morph;
      await nextTick();
    }
    return new Promise<void>((resolve) => {
      const transition = document.startViewTransition(
        () =>
          new Promise<void>((done) => {
            finishTransition = done;
            setTimeout(done, 1500);
            resolve();
          }),
      );
      void transition.finished.finally(() => {
        if (run === morphs) morphing.value = null;
      });
    });
  });

  router.afterEach(async (to, from, failure) => {
    if (typeof document === 'undefined') return;
    if (finishTransition) {
      const done = finishTransition;
      finishTransition = undefined;
      nextTick(done);
    }
    if (failure) return;
    // Opened from the studio page (not a shared link or a refresh), a project shows over that page.
    overlay.value = from !== START_LOCATION && to.name === 'work' && isOverStudio();
    applyPageMetadata(to.path, directory.value, locale);
  });
  return router;
}
