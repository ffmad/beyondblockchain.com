<script setup lang="ts">
import ArrowIcon from './ArrowIcon.vue';
import ContactForm from './ContactForm.vue';
import { useLocale } from '../i18n';

// The one "Say hello": a panel with the contact form, opened from the navbar and from the footer on every page.
// It sits under the navbar on wide screens and takes the whole screen on phones.
const { t } = useLocale();
</script>

<template>
  <div id="say-hello" popover class="hello-panel" aria-labelledby="say-hello-title">
    <div class="hello-head">
      <p id="say-hello-title" class="hello-title">{{ t('nav.sayHello') }}</p>
      <button
        type="button"
        class="hello-close"
        popovertarget="say-hello"
        popovertargetaction="hide"
      >
        <span class="sr-only">{{ t('project.close') }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>
    <p class="hello-lead">{{ t('hello.lead') }}</p>
    <ContactForm />
    <p class="hello-elsewhere">{{ t('hello.elsewhere') }}</p>
    <ul class="hello-links">
      <li>
        <a href="https://www.linkedin.com/in/qdebeauchesne/">LinkedIn <ArrowIcon /></a>
      </li>
      <li>
        <a href="https://github.com/ffmad">GitHub <small>ffmad</small> <ArrowIcon /></a>
      </li>
      <li>
        <a href="https://x.com/quentinbdb">X <small>quentinbdb</small> <ArrowIcon /></a>
      </li>
    </ul>
  </div>
</template>
