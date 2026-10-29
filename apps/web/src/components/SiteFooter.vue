<script setup lang="ts">
import ArrowIcon from './ArrowIcon.vue';
defineProps<{ personal: boolean }>();
</script>

<template>
  <footer id="elsewhere" class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <div>
          <p class="eyebrow">{{ personal ? 'Elsewhere' : 'Beyond Blockchain' }}</p>
          <h2>Say hello.</h2>
          <p class="footer-invitation">
            {{
              personal
                ? 'Find me on LinkedIn, on GitHub as ffmad and on X as quentinbdb.'
                : 'Questions about Ikitai, Fairmints or FestCompass? Quentin is on LinkedIn, GitHub and X.'
            }}
          </p>
        </div>
        <a
          class="round-link"
          href="https://www.linkedin.com/in/qdebeauchesne/"
          aria-label="Contact Quentin on LinkedIn"
          ><ArrowIcon
        /></a>
      </div>
      <div class="footer-bottom">
        <p>
          © {{ new Date().getFullYear() }} Beyond Blockchain
          <span class="footer-byline">· Built by Quentin.</span>
        </p>
        <div class="social-links" aria-label="Social links">
          <a href="https://github.com/ffmad">GitHub <ArrowIcon /></a>
          <a href="https://www.linkedin.com/in/qdebeauchesne/">LinkedIn <ArrowIcon /></a>
          <a href="https://x.com/quentinbdb">X <ArrowIcon /></a>
        </div>
        <a class="back-to-top" href="#page-top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </div>
  </footer>
</template>
