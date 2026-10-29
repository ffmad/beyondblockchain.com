<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// The original mark. With `entrance` (opt-in), small blocks assemble it once on first load (≤ 750 ms), along
// the rocket's diagonal, then hand off to the untouched SVG. Late loads and reduced motion skip it.
const props = withDefaults(defineProps<{ entrance?: boolean }>(), { entrance: false });
const image = ref<HTMLImageElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const entering = ref(false);
let frame = 0;
let detach = () => {};

const DURATION = 750;
const COLUMNS = 16;
const LATEST_START = 1000;

function settle() {
  detach();
  cancelAnimationFrame(frame);
  frame = 0;
  entering.value = false;
  document.documentElement.classList.add('mark-ready');
  const context = canvas.value?.getContext('2d');
  if (context && canvas.value) context.clearRect(0, 0, canvas.value.width, canvas.value.height);
}

function assemble(mark: HTMLImageElement, target: HTMLCanvasElement) {
  const bounds = mark.getBoundingClientRect();
  const offscreen = bounds.bottom < 0 || bounds.top > window.innerHeight;
  const context = target.getContext('2d');
  if (!context || offscreen || performance.now() > LATEST_START) return settle();
  const width = mark.clientWidth;
  const height = mark.clientHeight;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  target.width = Math.round(width * ratio);
  target.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const cell = width / COLUMNS;
  const rows = Math.round(height / cell);
  let pixels: Uint8ClampedArray;
  try {
    const sample = document.createElement('canvas');
    sample.width = COLUMNS;
    sample.height = rows;
    const sampleContext = sample.getContext('2d');
    if (!sampleContext) return settle();
    sampleContext.drawImage(mark, 0, 0, COLUMNS, rows);
    pixels = sampleContext.getImageData(0, 0, COLUMNS, rows).data;
  } catch {
    return settle();
  }
  const tiles: { x: number; y: number; color: string; delay: number; distance: number }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      const i = (y * COLUMNS + x) * 4;
      if (pixels[i + 3]! < 150) continue;
      // 0 at the lower left, 1 at the upper right: the direction the rocket points.
      const along = (x / COLUMNS + (1 - y / rows)) / 2;
      tiles.push({
        x: x * cell,
        y: y * cell,
        color: `rgb(${pixels[i]},${pixels[i + 1]},${pixels[i + 2]})`,
        delay: along * 0.45,
        distance: 70 + along * 90,
      });
    }
  }
  entering.value = true;
  const start = performance.now();
  const step = (now: number) => {
    const progress = (now - start) / DURATION;
    context.clearRect(0, 0, width, height);
    for (const tile of tiles) {
      const t = Math.min(1, Math.max(0, (progress - tile.delay) / 0.55));
      if (t <= 0) continue;
      const eased = 1 - Math.pow(1 - t, 3);
      const back = (1 - eased) * tile.distance * Math.SQRT1_2;
      const size = cell * (0.92 + (1 - eased) * 0.3);
      context.globalAlpha = Math.min(1, t * 3);
      context.fillStyle = tile.color;
      context.fillRect(tile.x - back, tile.y + back, size, size);
    }
    context.globalAlpha = 1;
    if (progress < 1) frame = requestAnimationFrame(step);
    else settle();
  };
  frame = requestAnimationFrame(step);
}

onMounted(() => {
  const mark = image.value;
  const target = canvas.value;
  const skip =
    !props.entrance ||
    !mark ||
    !target ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('mark-ready');
  if (skip) return settle();
  if (mark.complete && mark.naturalWidth) return assemble(mark, target);
  const onLoad = () => assemble(mark, target);
  mark.addEventListener('load', onLoad, { once: true });
  mark.addEventListener('error', settle, { once: true });
  detach = () => {
    mark.removeEventListener('load', onLoad);
    mark.removeEventListener('error', settle);
    detach = () => {};
  };
});
onBeforeUnmount(settle);
</script>

<template>
  <div class="brand-mark" :class="{ 'has-entrance': entrance, 'is-entering': entering }">
    <img
      ref="image"
      src="/brand/beyond-blockchain-mark.svg"
      alt="Beyond Blockchain"
      width="120"
      height="130"
      fetchpriority="high"
    />
    <canvas v-if="entrance" ref="canvas" aria-hidden="true"></canvas>
  </div>
</template>
