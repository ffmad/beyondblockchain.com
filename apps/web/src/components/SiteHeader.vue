<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ArrowIcon from './ArrowIcon.vue';
import BrandMark from './BrandMark.vue';
import { useProjectOverlay } from '../composables/useProjectOverlay';
import { languageNames, switchLanguage, useLocale } from '../i18n';
import { localizedPath } from '@beyond/shared/metadata.js';

defineProps<{ personal: boolean }>();
const route = useRoute();
const overlay = useProjectOverlay();
const { t, locale } = useLocale();
// The same page in the other language. It's a full page load: each language has its own address space.
const other = locale === 'en' ? 'ja' : 'en';
const otherHref = computed(() => localizedPath(route.fullPath, other));
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
  measure();
});
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
    class="site-header"
    :class="[
      personal ? 'header-personal' : 'header-studio',
      { 'is-stuck': stuck, 'is-named': named },
    ]"
    tabindex="-1"
  >
    <div v-if="personal" class="header-inner wrap">
      <RouterLink class="personal-mark" to="/quentin" aria-label="Quentin de Beauchesne"
        >quentin <span aria-hidden="true">/</span> ffmad</RouterLink
      >
      <nav :aria-label="t('nav.onThisPage')" class="main-nav">
        <a href="#now">{{ t('nav.now') }}</a>
        <a href="#story">{{ t('nav.story') }}</a>
        <a href="#elsewhere">{{ t('nav.elsewhere') }}</a>
        <a
          class="language-link"
          :href="otherHref"
          :lang="other"
          :hreflang="other"
          @click="switchLanguage"
          >{{ languageNames[other] }}</a
        >
      </nav>
      <RouterLink class="studio-link" to="/" :aria-label="t('nav.studio')"
        ><img src="/brand/beyond-blockchain-mark.svg" alt="" width="22" height="24" /><span
          class="studio-full"
          >Beyond Blockchain</span
        ><span class="studio-short" aria-hidden="true">{{ t('nav.studioShort') }}</span></RouterLink
      >
    </div>
    <div v-else class="header-inner wrap">
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
        <RouterLink to="/quentin" class="nav-about"
          >{{ t('nav.about') }} <ArrowIcon direction="right"
        /></RouterLink>
        <a
          class="language-link"
          :href="otherHref"
          :lang="other"
          :hreflang="other"
          @click="switchLanguage"
          >{{ languageNames[other] }}</a
        >
        <button type="button" class="hello-button" popovertarget="say-hello">
          {{ t('nav.sayHello') }}
        </button>
      </nav>
    </div>
  </header>
</template>
