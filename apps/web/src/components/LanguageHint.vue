<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { localizedPath } from '@beyond/shared/metadata.js';
import { languageChoiceKey, rememberLanguageChoice, switchLanguage, useLocale } from '../i18n';

// On an English page in a browser that prefers Japanese, a small note offers the Japanese version. It never
// redirects (shared links keep working), appears only after the page has loaded, and goes away for good once
// dismissed or once the visitor picks a language themselves.
const { locale } = useLocale();
const route = useRoute();
const shown = ref(false);
const href = computed(() => localizedPath(route.fullPath, 'ja'));

function dismiss() {
  shown.value = false;
  rememberLanguageChoice();
}

onMounted(() => {
  if (locale !== 'en' || !navigator.language?.toLowerCase().startsWith('ja')) return;
  try {
    if (localStorage.getItem(languageChoiceKey)) return;
  } catch {
    // Storage blocked: still offer it.
  }
  shown.value = true;
});
</script>

<template>
  <Transition name="language-hint">
    <aside v-if="shown" class="language-hint" lang="ja" aria-label="言語">
      <a :href="href" hreflang="ja" @click="switchLanguage"
        >日本語でも見られます <span aria-hidden="true">→</span></a
      >
      <button type="button" class="language-hint-close" @click="dismiss">
        <span class="sr-only">閉じる</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </aside>
  </Transition>
</template>
