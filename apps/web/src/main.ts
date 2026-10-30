import type { InitialResources } from '@beyond/shared';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-mono/latin-400.css';
import '@fontsource-variable/bricolage-grotesque/wdth.css';
import { localeFromPath } from '@beyond/shared/metadata.js';
import { createSiteApp } from './app';
import './styles/global.css';
import './styles/home.css';
import './styles/stack.css';
import './styles/profile.css';
import './styles/bot.css';

const snapshot = document.getElementById('initial-resources');
const resources = snapshot?.textContent
  ? (JSON.parse(snapshot.textContent) as InitialResources)
  : undefined;
const { app, router } = createSiteApp(resources, false, localeFromPath(window.location.pathname));
await router.isReady();
// After a language switch the page first rewrites its text (index.html); the app starts once that's done, so the
// animation has the phone to itself.
await Promise.race([
  window.__languageSettled ?? Promise.resolve(),
  new Promise((resolve) => setTimeout(resolve, 2500)),
]);
window.__languageFinish?.();
app.mount('#app');
