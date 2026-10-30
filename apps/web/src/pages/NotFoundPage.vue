<script setup lang="ts">
import { useLocale } from '../i18n';

const { t } = useLocale();
</script>

<template>
  <section class="wrap not-found">
    <p class="eyebrow">404</p>
    <h1>{{ t('notFound.title') }}</h1>
    <p>{{ t('notFound.text') }}</p>
    <RouterLink class="button button-dark" to="/"
      >{{ t('notFound.back') }} <span aria-hidden="true">→</span></RouterLink
    >
  </section>
</template>
