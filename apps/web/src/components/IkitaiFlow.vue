<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ikitaiScreens } from '../content/app-screens';
import CaptureViewer from './CaptureViewer.vue';

// One honest workflow from real screens: the saved demo post, then the plan Ikitai shows for it.
// The server renders the finished state; on first view the scan and reveal play once.
type ScreenId = (typeof ikitaiScreens)[number]['id'];
const active = ref<ScreenId>('details');
const waiting = ref(false);
const scanning = ref(false);
const root = ref<HTMLElement | null>(null);
const phone = ref<HTMLElement | null>(null);
const current = computed(
  () => ikitaiScreens.find((s) => s.id === active.value) ?? ikitaiScreens[0],
);
let observer: IntersectionObserver | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let reveal: Animation | undefined;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Stops anything scheduled, so a visitor's own choice always wins over the replay.
function interrupt() {
  clearTimeout(timer);
  observer?.disconnect();
  observer = undefined;
  scanning.value = false;
  reveal?.cancel();
}

function show(id: ScreenId) {
  active.value = id;
  waiting.value = false;
  if (reduceMotion()) return;
  requestAnimationFrame(() => {
    const image = phone.value?.querySelector<HTMLElement>(`[data-screen="${id}"]`);
    reveal = image?.animate(
      [
        { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%)' },
        { clipPath: 'polygon(0% 100%, 220% 100%, 0% -120%)' },
      ],
      { duration: 700, easing: 'cubic-bezier(.7,0,.2,1)' },
    );
  });
}

function choose(id: ScreenId) {
  interrupt();
  show(id);
}

function play() {
  interrupt();
  if (reduceMotion()) return show('details');
  waiting.value = true;
  requestAnimationFrame(() => (scanning.value = true));
  timer = setTimeout(() => {
    scanning.value = false;
    show('details');
  }, 950);
}

onMounted(() => {
  const element = root.value;
  if (!element || reduceMotion() || !('IntersectionObserver' in window)) return;
  // Only stage the "before" state while the demo is still below the fold.
  if (element.getBoundingClientRect().top < window.innerHeight) return;
  waiting.value = true;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) play();
    },
    { threshold: 0.45 },
  );
  observer.observe(element);
});
onBeforeUnmount(interrupt);
</script>

<template>
  <div ref="root" class="ikitai-flow">
    <figure class="flow-source" :class="{ scanning }">
      <div class="flow-post">
        <img
          src="/projects/ikitai-source-post.png"
          alt="A saved social post announcing the Kumo to Neon one-man live: 11.14 at Lumina Hall Shibuya, tickets on sale 10.24."
          width="1080"
          height="1600"
          loading="lazy"
        />
        <span class="flow-scan" aria-hidden="true"></span>
      </div>
      <figcaption>A saved post</figcaption>
    </figure>
    <span class="flow-arrow" aria-hidden="true"></span>
    <figure class="flow-phone">
      <CaptureViewer
        :src="current.src"
        :alt="current.alt"
        :width="1320"
        :height="2868"
        :title="`Ikitai · ${current.label}`"
        caption="Real Ikitai app screen · Fictional demo plans"
        phone
      >
        <span ref="phone" class="phone-frame" :class="{ waiting }">
          <span class="phone-empty" aria-hidden="true"
            ><img src="/projects/ikitai-logo.svg" alt="" width="56" height="56" />Saved to
            Ikitai</span
          >
          <img
            v-for="screen in ikitaiScreens"
            :key="screen.id"
            :data-screen="screen.id"
            class="phone-screen"
            :class="{ active: active === screen.id && !waiting }"
            :src="screen.src"
            :alt="active === screen.id ? screen.alt : ''"
            :aria-hidden="active !== screen.id"
            width="1320"
            height="2868"
            loading="lazy"
          />
        </span>
      </CaptureViewer>
      <figcaption>{{ current.label }} in Ikitai</figcaption>
    </figure>
    <div class="flow-controls">
      <div class="flow-tabs" role="group" aria-label="Ikitai screens">
        <button
          v-for="screen in ikitaiScreens"
          :key="screen.id"
          type="button"
          :aria-pressed="active === screen.id && !waiting"
          @click="choose(screen.id)"
        >
          {{ screen.label }}
        </button>
      </div>
      <button type="button" class="flow-replay" @click="play">
        Replay: post to plan <span aria-hidden="true">↻</span>
      </button>
      <p class="flow-note">
        Real Ikitai screens with the fictional demo plans from its store captures.
      </p>
    </div>
  </div>
</template>
