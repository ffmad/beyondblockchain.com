<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue';
import {
  hexagonPath,
  rocketHeading,
  rocketPath,
  rocketTail,
  trailPath,
  windowPath,
} from '../content/brand-mark';

// The original mark. With `animate`, it is built once on first load: the hexagon appears, then the rocket
// flies in from beyond the lower-left edge, carving its trail, and stops where it sits in the logo. The
// untouched SVG then takes over. If the mark starts below the fold, it plays when it scrolls into view.
// Reduced motion, `?entrance=off`, later visits and a late script on screen show the SVG directly.
const props = withDefaults(defineProps<{ animate?: boolean; alt?: string }>(), {
  animate: false,
  alt: 'Beyond Blockchain',
});
const id = useId();
const phase = ref<'idle' | 'waiting' | 'playing' | 'settling' | 'nudging'>('idle');
const root = ref<HTMLElement | null>(null);
const hexagon = ref<SVGGElement | null>(null);
const rocket = ref<SVGGElement | null>(null);
const wipe = ref<SVGRectElement | null>(null);
let frame = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let observer: IntersectionObserver | undefined;

const LATEST_START = 1200;
const HEXAGON_IN = 280;
const FLIGHT_START = 200;
const FLIGHT = 900;
const SETTLE = 280;
const DISTANCE = 100;
const VISIBLE = 0.6;
const NUDGE = 620;
const NUDGE_DISTANCE = 5;
const HEADING = (Math.atan2(rocketHeading.y, rocketHeading.x) * 180) / Math.PI;

function ready() {
  document.documentElement.classList.remove('mark-waiting');
  document.documentElement.classList.add('mark-ready');
}
function finish() {
  observer?.disconnect();
  cancelAnimationFrame(frame);
  clearTimeout(timer);
  frame = 0;
  phase.value = 'idle';
  ready();
}

function render(elapsed: number) {
  const appear = 1 - Math.pow(1 - Math.min(1, elapsed / HEXAGON_IN), 3);
  hexagon.value?.setAttribute(
    'transform',
    `translate(60.4 64) scale(${0.86 + 0.14 * appear}) translate(-60.4 -64)`,
  );
  hexagon.value?.setAttribute('opacity', String(appear));
  // The rocket decelerates to a stop; the trail is revealed up to its tail.
  const flight = Math.min(1, Math.max(0, (elapsed - FLIGHT_START) / FLIGHT));
  const back = Math.pow(1 - flight, 3) * DISTANCE;
  const dx = -rocketHeading.x * back;
  const dy = -rocketHeading.y * back;
  rocket.value?.setAttribute('transform', `translate(${dx} ${dy})`);
  wipe.value?.setAttribute(
    'transform',
    `translate(${rocketTail.x + dx} ${rocketTail.y + dy}) rotate(${HEADING})`,
  );
}

function play() {
  render(0);
  phase.value = 'playing';
  // The clock starts on the first painted frame, so a tab opened in the background still plays it fully.
  let start = 0;
  const step = (now: number) => {
    if (!start) start = now;
    const elapsed = now - start;
    render(elapsed);
    if (elapsed < FLIGHT_START + FLIGHT) {
      frame = requestAnimationFrame(step);
      return;
    }
    // The original SVG fades in over the finished frame, adding its highlights.
    phase.value = 'settling';
    timer = setTimeout(finish, SETTLE);
  };
  frame = requestAnimationFrame(step);
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Plays the whole build again, e.g. when the logo is clicked on the page it links to. */
function replay() {
  if (!props.animate || !hexagon.value || reduceMotion() || phase.value === 'playing') return;
  cancelAnimationFrame(frame);
  clearTimeout(timer);
  play();
}

/** On hover the rocket pushes a little further along its heading, then settles back. */
function nudge() {
  if (!props.animate || !rocket.value || reduceMotion() || phase.value !== 'idle') return;
  render(FLIGHT_START + FLIGHT);
  phase.value = 'nudging';
  let start = 0;
  const step = (now: number) => {
    if (!start) start = now;
    const t = Math.min(1, (now - start) / NUDGE);
    const push = Math.sin(Math.PI * t) * NUDGE_DISTANCE;
    rocket.value?.setAttribute(
      'transform',
      `translate(${rocketHeading.x * push} ${rocketHeading.y * push})`,
    );
    if (t < 1) frame = requestAnimationFrame(step);
    else phase.value = 'idle';
  };
  frame = requestAnimationFrame(step);
}
defineExpose({ replay, nudge });

onMounted(() => {
  if (!props.animate) return;
  const html = document.documentElement;
  const element = root.value;
  const skip =
    !element ||
    !hexagon.value ||
    html.classList.contains('mark-ready') ||
    new URLSearchParams(window.location.search).get('entrance') === 'off' ||
    reduceMotion();
  if (skip) return ready();
  const bounds = element.getBoundingClientRect();
  const shown =
    Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0)) /
    bounds.height;
  // If the static logo may already have been seen, never take it away to replay it.
  const late = performance.now() > LATEST_START;
  if (shown >= VISIBLE) return late ? ready() : play();
  if ((late && shown > 0) || !('IntersectionObserver' in window)) return ready();
  phase.value = 'waiting';
  html.classList.add('mark-waiting');
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer?.disconnect();
      play();
    },
    { threshold: VISIBLE },
  );
  observer.observe(element);
});
onBeforeUnmount(() => {
  if (props.animate) finish();
});
</script>

<template>
  <div
    ref="root"
    class="brand-mark"
    :class="{
      'can-animate': animate,
      'is-waiting': phase === 'waiting',
      'is-playing': phase === 'playing',
      'is-settling': phase === 'settling',
      'is-nudging': phase === 'nudging',
    }"
  >
    <img
      src="/brand/beyond-blockchain-mark.svg"
      :alt="alt"
      width="120"
      height="130"
      fetchpriority="high"
    />
    <svg v-if="animate" class="mark-motion" viewBox="0 0 120 130" aria-hidden="true">
      <defs>
        <radialGradient
          :id="`${id}-fill`"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(-38.7571 142.504) scale(180.017 180.017)"
        >
          <stop stop-color="white" />
          <stop offset="0.19" stop-color="#CDD7E8" />
          <stop offset="0.48" stop-color="#859DC8" />
          <stop offset="0.72" stop-color="#5072AF" />
          <stop offset="0.9" stop-color="#2F58A1" />
          <stop offset="1" stop-color="#234E9B" />
        </radialGradient>
        <clipPath :id="`${id}-wipe`">
          <rect ref="wipe" x="-240" y="-120" width="240" height="240" />
        </clipPath>
        <mask
          :id="`${id}-cut`"
          maskUnits="userSpaceOnUse"
          x="-140"
          y="-140"
          width="400"
          height="410"
        >
          <rect x="-140" y="-140" width="400" height="410" fill="#fff" />
          <path :d="trailPath" fill="#000" :clip-path="`url(#${id}-wipe)`" />
          <g ref="rocket">
            <path :d="rocketPath" fill="#000" />
            <path :d="windowPath" fill="#fff" />
          </g>
        </mask>
      </defs>
      <g ref="hexagon">
        <path :d="hexagonPath" :fill="`url(#${id}-fill)`" :mask="`url(#${id}-cut)`" />
      </g>
    </svg>
  </div>
</template>
