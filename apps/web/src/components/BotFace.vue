<script setup lang="ts">
import { useId } from 'vue';

// The assistant's face: the logo's hexagon with two eyes and a small smile. The eyes look where they're told
// (`look`, in the face's own units) and close into happy arcs when it's `happy`. They blink on their own unless
// told when (`blink`).
withDefaults(
  defineProps<{
    look?: { x: number; y: number };
    mood?: 'calm' | 'happy';
    blink?: boolean | null;
  }>(),
  { look: () => ({ x: 0, y: 0 }), mood: 'calm', blink: null },
);
const id = useId();
</script>

<template>
  <svg
    class="bot-face"
    :class="[`is-${mood}`, { 'is-controlled': blink !== null, 'is-blinking': blink }]"
    viewBox="0 0 40 44"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`${id}-fill`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#859dc8" />
        <stop offset="0.55" stop-color="#3a63ad" />
        <stop offset="1" stop-color="#234e9b" />
      </linearGradient>
    </defs>
    <path
      d="M20 3 36.5 12.5v19L20 41 3.5 31.5v-19Z"
      :fill="`url(#${id}-fill)`"
      :stroke="`url(#${id}-fill)`"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <g class="bot-look" :style="{ transform: `translate(${look.x}px, ${look.y}px)` }">
      <g
        v-if="mood === 'happy'"
        fill="none"
        stroke="#fff"
        stroke-width="2.2"
        stroke-linecap="round"
      >
        <path d="M12.8 22.4q2.4-3.4 4.8 0" />
        <path d="M22.4 22.4q2.4-3.4 4.8 0" />
      </g>
      <g v-else class="bot-eyes" fill="#fff">
        <rect x="13" y="17" width="4.4" height="7.5" rx="2.2" />
        <rect x="22.6" y="17" width="4.4" height="7.5" rx="2.2" />
      </g>
    </g>
    <path
      :d="mood === 'happy' ? 'M15.6 28.4q4.4 4 8.8 0' : 'M16.5 29.2q3.5 2.8 7 0'"
      fill="none"
      stroke="#fff"
      stroke-width="1.8"
      stroke-linecap="round"
    />
  </svg>
</template>
