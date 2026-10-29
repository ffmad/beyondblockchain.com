<script setup lang="ts">
import ArrowIcon from './ArrowIcon.vue';
defineProps<{ personal: boolean }>();
</script>

<template>
  <header id="page-top" class="site-header" tabindex="-1">
    <div v-if="personal" class="header-inner wrap">
      <RouterLink class="personal-mark" to="/quentin" aria-label="Quentin de Beauchesne"
        >quentin <span aria-hidden="true">/</span> ffmad</RouterLink
      >
      <nav aria-label="On this page" class="main-nav">
        <a href="#now">Now</a>
        <a href="#story">Story</a>
        <a href="#elsewhere">Elsewhere</a>
      </nav>
      <RouterLink class="studio-link" to="/" aria-label="Beyond Blockchain studio"
        ><img src="/brand/beyond-blockchain-mark.svg" alt="" width="22" height="24" /><span
          class="studio-full"
          >Beyond Blockchain</span
        ><span class="studio-short" aria-hidden="true">Studio</span></RouterLink
      >
    </div>
    <div v-else class="header-inner wrap">
      <RouterLink class="wordmark" to="/" aria-label="Beyond Blockchain home"
        ><img
          src="/brand/beyond-blockchain-logo.svg"
          alt="Beyond Blockchain"
          width="178"
          height="65"
      /></RouterLink>
      <nav aria-label="Main navigation" class="main-nav">
        <a href="/#work">Work</a>
        <RouterLink to="/quentin">Quentin</RouterLink>
        <a class="header-contact" href="https://www.linkedin.com/in/qdebeauchesne/"
          >Contact <ArrowIcon
        /></a>
      </nav>
    </div>
  </header>
</template>
