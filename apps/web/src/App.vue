<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import SayHello from './components/SayHello.vue';
import LanguageHint from './components/LanguageHint.vue';
import { useProjectOverlay } from './composables/useProjectOverlay';
import { useLocale } from './i18n';

const route = useRoute();
const { t } = useLocale();
const router = useRouter();
// The studio and the personal page deliberately use different palettes and type.
const personal = computed(() => route.path.replace(/\/$/, '') === '/quentin');
// A project opened over the studio page keeps the studio page underneath it.
const overlay = useProjectOverlay();
const studio = router.resolve('/') as RouteLocationNormalizedLoaded;
watch(
  () => [route.path, overlay.value] as const,
  async ([, over], [, wasOver]) => {
    // The project window looks after focus itself.
    if (over || wasOver) return;
    await nextTick();
    // A page can name its own starting point (a project page starts on its name).
    const start =
      document.querySelector<HTMLElement>('[data-page-focus]') ??
      document.getElementById('main-content');
    start?.focus({ preventScroll: true });
  },
);
</script>

<template>
  <div class="site" :class="personal ? 'site-personal' : 'site-studio'">
    <a href="#main-content" class="skip-link">{{ t('skipToContent') }}</a>
    <SiteHeader :personal="personal" />
    <main id="main-content" tabindex="-1">
      <RouterView :route="overlay ? studio : undefined" />
    </main>
    <SiteFooter :personal="personal" />
    <SayHello />
    <LanguageHint />
  </div>
</template>
