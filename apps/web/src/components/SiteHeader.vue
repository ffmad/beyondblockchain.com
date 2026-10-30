<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import BrandMark from './BrandMark.vue';
import HelloBot from './HelloBot.vue';
import { useProjectOverlay } from '../composables/useProjectOverlay';
import { switchLanguage, useLocale, type Locale } from '../i18n';
import { localizedPath } from '@beyond/shared/metadata.js';

const route = useRoute();
const overlay = useProjectOverlay();
const { t, locale } = useLocale();
// The same page in the other language. It's a full page load: each language has its own address space.
const other = locale === 'en' ? 'ja' : 'en';
const languageOrder = ['en', 'ja'] as const;
const languageShort = { en: 'EN', ja: '日本語' } as const;
const otherHref = computed(() => localizedPath(route.fullPath, other));

// A tap on the switch slides its highlight to the other language at once, while that language's page loads. The
// page is fetched in the background as soon as this one is ready, so the switch doesn't wait for the network.
const languageSwitch = ref<HTMLAnchorElement | null>(null);
const shown = ref<Locale>(locale);
const thumb = ref<{ x: number; width: number } | null>(null);
function placeThumb(language: Locale) {
  const option = languageSwitch.value?.querySelector<HTMLElement>(`[data-language="${language}"]`);
  if (option) thumb.value = { x: option.offsetLeft, width: option.offsetWidth };
}
function onLanguage(event: MouseEvent) {
  switchLanguage(event);
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  shown.value = other;
  placeThumb(other);
}
let prefetched: HTMLElement | null = null;
function prefetchOther() {
  prefetched?.remove();
  if (HTMLScriptElement.supports?.('speculationrules')) {
    prefetched = Object.assign(document.createElement('script'), {
      type: 'speculationrules',
      textContent: JSON.stringify({
        prefetch: [{ source: 'list', urls: [otherHref.value], eagerness: 'eager' }],
      }),
    });
  } else
    prefetched = Object.assign(document.createElement('link'), {
      rel: 'prefetch',
      href: otherHref.value,
    });
  document.head.append(prefetched);
}
const onResize = () => placeThumb(shown.value);
const header = ref<HTMLElement | null>(null);
const mark = ref<InstanceType<typeof BrandMark> | null>(null);

// The bar follows the reader: it condenses once the page scrolls and shows the studio's name only after the
// masthead has gone. A project open over the studio page leaves it as it was.
const isHome = computed(() => route.path === '/' || overlay.value);
const stuck = ref(false);
const pastMasthead = ref(false);
const named = computed(() => !isHome.value || pastMasthead.value);
let frame = 0;

function measure() {
  frame = 0;
  const line = header.value?.getBoundingClientRect().bottom ?? 72;
  stuck.value = window.scrollY > 4;
  const title = document.getElementById('studio-title');
  pastMasthead.value = !title || title.getBoundingClientRect().bottom < line;
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(measure);
}
onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('resize', onResize);
  measure();
  placeThumb(locale);
  // Once the fonts are in, the labels have their final widths.
  void document.fonts?.ready.then(() => placeThumb(shown.value));
  prefetchOther();
});
watch(otherHref, prefetchOther);
watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    measure();
  },
);
onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  window.removeEventListener('resize', onResize);
  prefetched?.remove();
  cancelAnimationFrame(frame);
});

// Clicking the logo on the studio page goes back to the top and plays the build again.
function goHome(event: MouseEvent, navigate: (event?: MouseEvent) => unknown) {
  if (route.path !== '/' || event.metaKey || event.ctrlKey || event.shiftKey || event.button)
    return navigate(event);
  event.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  if (route.hash) history.replaceState(history.state, '', '/');
  mark.value?.replay();
}
</script>

<template>
  <header
    id="page-top"
    ref="header"
    class="site-header header-studio"
    :class="{ 'is-stuck': stuck, 'is-named': named }"
    tabindex="-1"
  >
    <div class="header-inner wrap">
      <div class="identity">
        <RouterLink v-slot="{ href, navigate }" to="/" custom>
          <a
            :href="href"
            class="wordmark"
            :aria-label="t('nav.home')"
            @click="goHome($event, navigate)"
            @pointerenter="$event.pointerType === 'mouse' && mark?.nudge()"
            ><BrandMark ref="mark" class="header-mark" animate alt="" /><span class="wordmark-name"
              >Beyond Blockchain</span
            ></a
          >
        </RouterLink>
      </div>
      <nav :aria-label="t('nav.main')" class="main-nav">
        <RouterLink
          to="/#projects"
          class="nav-projects-link"
          exact-active-class=""
          active-class=""
          >{{ t('nav.projects') }}</RouterLink
        >
        <RouterLink to="/quentin" class="nav-about">{{ t('nav.about') }}</RouterLink>
        <!-- Both languages in one switch: a tap anywhere on it changes language. -->
        <a
          ref="languageSwitch"
          class="language-switch"
          :class="{ 'has-thumb': thumb }"
          :href="otherHref"
          :lang="other"
          :hreflang="other"
          :aria-label="t('nav.switchLanguage')"
          @click="onLanguage"
        >
          <span
            v-if="thumb"
            class="language-thumb"
            aria-hidden="true"
            :style="{ transform: `translateX(${thumb.x}px)`, width: `${thumb.width}px` }"
          ></span>
          <span
            v-for="language in languageOrder"
            :key="language"
            class="language-option"
            :class="{ 'is-current': language === shown }"
            :data-language="language"
            :lang="language"
            aria-hidden="true"
            >{{ languageShort[language] }}</span
          >
        </a>
        <HelloBot />
      </nav>
    </div>
  </header>
</template>
