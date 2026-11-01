<script setup lang="ts">
import { useLocale } from '../i18n';
import { privacy } from '../content/privacy';

const { locale } = useLocale();
const policy = privacy[locale];
</script>

<template>
  <article class="wrap privacy-page" aria-labelledby="privacy-title">
    <header class="privacy-head">
      <h1 id="privacy-title">{{ policy.title }}</h1>
      <p class="eyebrow">{{ policy.effective }}</p>
      <p class="privacy-intro">{{ policy.intro }}</p>
      <dl class="privacy-operator">
        <div v-for="item in policy.operator" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </header>
    <section v-for="section in policy.sections" :key="section.heading" class="privacy-section">
      <h2>{{ section.heading }}</h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
    </section>
  </article>
</template>
