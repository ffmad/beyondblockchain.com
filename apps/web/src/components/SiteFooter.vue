<script setup lang="ts">
import ArrowIcon from './ArrowIcon.vue';
import { useLocale } from '../i18n';
defineProps<{ personal: boolean }>();
const { t } = useLocale();
</script>

<template>
  <footer id="elsewhere" class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <div>
          <p class="eyebrow">{{ personal ? t('footer.personalKicker') : 'Beyond Blockchain' }}</p>
          <h2>{{ t('footer.title') }}</h2>
          <p class="footer-invitation">
            {{ personal ? t('footer.personalInvitation') : t('footer.studioInvitation') }}
          </p>
        </div>
        <button
          type="button"
          class="round-link"
          popovertarget="hello-bot"
          :aria-label="t('footer.contact')"
        >
          <ArrowIcon />
        </button>
      </div>
      <div class="footer-bottom">
        <p>
          © {{ new Date().getFullYear() }} Beyond Blockchain
          <span class="footer-byline">{{ t('footer.byline') }}</span>
        </p>
        <div class="social-links" :aria-label="t('footer.social')">
          <a href="https://github.com/ffmad">GitHub <ArrowIcon /></a>
          <a href="https://www.linkedin.com/in/qdebeauchesne/">LinkedIn <ArrowIcon /></a>
          <a href="https://x.com/quentinbdb">X <ArrowIcon /></a>
        </div>
        <a class="back-to-top" href="#page-top"
          >{{ t('footer.backToTop') }} <span aria-hidden="true">↑</span></a
        >
      </div>
    </div>
  </footer>
</template>
