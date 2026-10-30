<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLocale } from '../i18n';

// The product in use, leading its screens in the project window: silent and looping, with a button to pause
// it. Like the screens, a click opens the capture full size. With reduced motion or Save-Data it waits, showing
// the capture, until played.
const props = defineProps<{ src: string; poster: string; name: string; enlargeLabel: string }>();
const emit = defineEmits<{ enlarge: [] }>();
const { t } = useLocale();
const video = ref<HTMLVideoElement | null>(null);
const paused = ref(true);

function toggle() {
  const element = video.value;
  if (!element) return;
  if (element.paused) element.play().catch(() => undefined);
  else element.pause();
}

onMounted(() => {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  if (saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  video.value?.play().catch(() => undefined);
});
</script>

<template>
  <div class="shot-clip">
    <button type="button" class="shot-button" :aria-label="enlargeLabel" @click="emit('enlarge')">
      <video
        ref="video"
        class="shot-wide"
        :src="props.src"
        :poster="props.poster"
        width="1280"
        height="720"
        muted
        loop
        playsinline
        disablepictureinpicture
        preload="metadata"
        :aria-label="t('project.clip', { name })"
        @play="paused = false"
        @pause="paused = true"
      ></video>
    </button>
    <button type="button" class="clip-toggle" @click="toggle">
      <span class="sr-only">{{ paused ? t('project.playClip') : t('project.pauseClip') }}</span>
      <svg v-if="paused" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.5 2.5v11l9-5.5z" />
      </svg>
      <svg v-else viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 2.5h2.6v11H4zM9.4 2.5H12v11H9.4z" />
      </svg>
    </button>
  </div>
</template>
