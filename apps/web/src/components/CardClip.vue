<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// A product's clip over its card's screenshot: it plays while the pointer is on the card (or the card has
// keyboard focus) and fades back to the screenshot when it leaves. On touch screens the card most in view plays,
// one at a time. Nothing loads until a clip first plays; with reduced motion or Save-Data it never does.
const props = defineProps<{ src: string }>();
const video = ref<HTMLVideoElement | null>(null);
const playing = ref(false);
let card: HTMLElement | null = null;
const cleanups: (() => void)[] = [];

function play() {
  const element = video.value;
  if (!element) return;
  element.play().catch(() => undefined);
}
function stop() {
  const element = video.value;
  playing.value = false;
  element?.pause();
}

onMounted(() => {
  const element = video.value;
  card = element?.closest<HTMLElement>('.project-card') ?? null;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  if (!element || !card || saveData) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const onPlaying = () => (playing.value = true);
  element.addEventListener('playing', onPlaying);
  cleanups.push(() => element.removeEventListener('playing', onPlaying));

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const enter = (event: Event) => {
      if (event.type === 'pointerenter' && (event as PointerEvent).pointerType !== 'mouse') return;
      // Each hover starts from the beginning, where the screenshot is.
      if (element.paused) element.currentTime = 0;
      play();
    };
    const leave = (event: Event) => {
      if (event.type === 'focusout' && card!.contains((event as FocusEvent).relatedTarget as Node))
        return;
      stop();
    };
    for (const [type, handler] of [
      ['pointerenter', enter],
      ['pointerleave', leave],
      ['focusin', enter],
      ['focusout', leave],
    ] as const) {
      card.addEventListener(type, handler);
      cleanups.push(() => card?.removeEventListener(type, handler));
    }
  } else {
    onScreen.set(card, { ratio: 0, play, stop });
    touchObserver().observe(card);
    cleanups.push(() => {
      touchObserver().unobserve(card!);
      onScreen.delete(card!);
    });
  }
});

onBeforeUnmount(() => {
  stop();
  cleanups.forEach((cleanup) => cleanup());
});
</script>

<script lang="ts">
// On touch screens, the card most in view (at least 60% of it) plays its clip; the others wait.
const onScreen = new Map<Element, { ratio: number; play: () => void; stop: () => void }>();
let observer: IntersectionObserver | undefined;
let current: Element | null = null;

function touchObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const clip = onScreen.get(entry.target);
        if (clip) clip.ratio = entry.intersectionRatio;
      }
      let best: Element | null = null;
      for (const [element, clip] of onScreen)
        if (clip.ratio >= 0.6 && (!best || clip.ratio > onScreen.get(best)!.ratio)) best = element;
      if (best === current) return;
      if (current) onScreen.get(current)?.stop();
      current = best;
      if (best) onScreen.get(best)!.play();
    },
    { threshold: [0, 0.6, 0.8, 1] },
  );
  return observer;
}
</script>

<template>
  <video
    ref="video"
    class="card-clip"
    :class="{ 'is-playing': playing }"
    :src="src"
    muted
    loop
    playsinline
    disablepictureinpicture
    preload="none"
    aria-hidden="true"
    tabindex="-1"
  ></video>
</template>
