<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';

const route = useRoute();
// The studio and the personal page deliberately use different palettes and type.
const personal = computed(() => route.path.replace(/\/$/, '') === '/quentin');
watch(
  () => route.path,
  async () => {
    await nextTick();
    document.getElementById('main-content')?.focus({ preventScroll: true });
  },
);
</script>

<template>
  <div class="site" :class="personal ? 'site-personal' : 'site-studio'">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <SiteHeader :personal="personal" />
    <main id="main-content" tabindex="-1"><RouterView /></main>
    <SiteFooter :personal="personal" />
  </div>
</template>
