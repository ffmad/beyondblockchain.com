<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

// A barely visible lattice of the logo's hexagon behind the studio hero, from the top of the page (under the
// transparent navbar) to the end of the hero. With a mouse, the hexagons near the cursor light up softly, and one
// ripple spreads from the logo once its entrance has played. On touch screens and with reduced motion it stays
// still. Drawn on a canvas: the lattice once per size, then only the lit hexagons while something moves.
const props = defineProps<{ hero: HTMLElement | null }>();
const canvas = ref<HTMLCanvasElement | null>(null);

const SIZE = 26; // hexagon radius, px
const GAP = 3; // between hexagons
const GLOW = 150; // reach of the cursor's light, px
const RIPPLE_SPEED = 720; // px per second
const RIPPLE_WIDTH = 64;
const RIPPLE_TIME = 1.7; // seconds
const INK = '35 78 155'; // --brand-700

interface Cell {
  x: number;
  y: number;
  base: number;
  light: number;
}
let cells: Cell[] = [];
let lattice: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let scale = 1;
let frame = 0;
let pointer: { x: number; y: number } | null = null;
let ripple: { x: number; y: number; start: number } | null = null;
let visible = true;
let lively = false;
// One ripple per page load, not each time the studio page comes back.
let rippled = false;
const cleanups: (() => void)[] = [];

function hexagon(target: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  target.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i) target.lineTo(px, py);
    else target.moveTo(px, py);
  }
  target.closePath();
}

// Where the logo is, in the canvas's coordinates.
function logoCentre() {
  const mark = document.querySelector('.header-mark')?.getBoundingClientRect();
  const box = canvas.value!.getBoundingClientRect();
  return mark
    ? { x: mark.left + mark.width / 2 - box.left, y: mark.top + mark.height / 2 - box.top }
    : { x: 40, y: 32 };
}

function layout() {
  const element = canvas.value;
  const page = element?.parentElement;
  if (!element || !page || !props.hero) return;
  // From the top of the document (behind the navbar) to the end of the hero.
  const lift = page.getBoundingClientRect().top + window.scrollY;
  const heroBottom = props.hero.getBoundingClientRect().bottom + window.scrollY;
  width = document.documentElement.clientWidth;
  height = Math.round(heroBottom);
  element.style.top = `${-lift}px`;
  element.style.height = `${height}px`;
  scale = Math.min(window.devicePixelRatio || 1, 2);
  element.width = Math.round(width * scale);
  element.height = Math.round(height * scale);
  context = element.getContext('2d');

  // The lattice fades with distance from the logo, so it reads as coming from it.
  const origin = logoCentre();
  const step = { x: Math.sqrt(3) * SIZE, y: 1.5 * SIZE };
  cells = [];
  for (let row = -1; row * step.y < height + SIZE; row++) {
    for (let col = -1; col * step.x < width + SIZE; col++) {
      const x = col * step.x + (row % 2 ? step.x / 2 : 0);
      const y = row * step.y;
      const distance = Math.hypot(x - origin.x, y - origin.y);
      const base = 0.055 * Math.max(0.35, 1 - distance / Math.max(width, 900));
      cells.push({ x, y, base, light: 0 });
    }
  }
  lattice = document.createElement('canvas');
  lattice.width = element.width;
  lattice.height = element.height;
  const draw = lattice.getContext('2d')!;
  draw.scale(scale, scale);
  draw.lineWidth = 1;
  for (const cell of cells) {
    hexagon(draw, cell.x, cell.y, SIZE - GAP / 2);
    draw.strokeStyle = `rgb(${INK} / ${cell.base})`;
    draw.stroke();
  }
  paint(performance.now());
}

function paint(now: number) {
  frame = 0;
  if (!context || !lattice) return;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width * scale, height * scale);
  context.drawImage(lattice, 0, 0);
  if (!lively) return;
  context.scale(scale, scale);
  const age = ripple ? (now - ripple.start) / 1000 : 0;
  if (ripple && age > RIPPLE_TIME) ripple = null;
  let moving = !!ripple;
  for (const cell of cells) {
    let target = 0;
    if (pointer) {
      const reach = 1 - Math.hypot(cell.x - pointer.x, cell.y - pointer.y) / GLOW;
      if (reach > 0) target = reach * reach * (3 - 2 * reach) * 0.85;
    }
    if (ripple) {
      const offset =
        (Math.hypot(cell.x - ripple.x, cell.y - ripple.y) - age * RIPPLE_SPEED) / RIPPLE_WIDTH;
      target = Math.max(target, Math.exp(-offset * offset) * 0.6 * (1 - age / RIPPLE_TIME));
    }
    // Hexagons light up quickly and fade slowly, leaving a short trail.
    cell.light += (target - cell.light) * (target > cell.light ? 0.3 : 0.06);
    if (cell.light < 0.004) cell.light = 0;
    if (!cell.light) continue;
    moving = true;
    hexagon(context, cell.x, cell.y, SIZE - GAP / 2);
    context.fillStyle = `rgb(${INK} / ${0.11 * cell.light})`;
    context.fill();
    context.strokeStyle = `rgb(${INK} / ${cell.base + 0.42 * cell.light})`;
    context.stroke();
  }
  if (moving && visible) frame = requestAnimationFrame(paint);
}

function wake() {
  if (!frame && visible) frame = requestAnimationFrame(paint);
}

function listen<K extends keyof WindowEventMap>(
  target: Window | Document,
  type: K,
  handler: (event: WindowEventMap[K]) => void,
) {
  target.addEventListener(type, handler as EventListener, { passive: true });
  cleanups.push(() => target.removeEventListener(type, handler as EventListener));
}

// The hero is the page's element, so it arrives just after this canvas is in place.
let started = false;
watch(
  () => props.hero,
  () => {
    if (!started && canvas.value && props.hero) start(canvas.value, props.hero);
  },
  { flush: 'post' },
);

function start(element: HTMLCanvasElement, hero: HTMLElement) {
  started = true;
  lively =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  layout();
  const resize = new ResizeObserver(() => layout());
  resize.observe(hero);
  cleanups.push(() => resize.disconnect());
  if (!lively) return;
  const playRipple = !rippled;
  rippled = true;

  const seen = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    if (visible) wake();
  });
  seen.observe(element);
  cleanups.push(() => seen.disconnect());

  listen(window, 'pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const box = element.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    pointer = x >= 0 && y >= 0 && x <= box.width && y <= box.height ? { x, y } : null;
    wake();
  });
  listen(document, 'pointerleave', () => {
    pointer = null;
    wake();
  });

  // The ripple waits for the logo's entrance (see BrandMark) and plays once per page load.
  const spread = () => {
    ripple = { ...logoCentre(), start: performance.now() };
    wake();
  };
  const root = document.documentElement;
  if (!playRipple) return;
  if (root.classList.contains('mark-ready')) {
    const timer = setTimeout(spread, 200);
    cleanups.push(() => clearTimeout(timer));
  } else {
    const waiting = new MutationObserver(() => {
      if (!root.classList.contains('mark-ready')) return;
      waiting.disconnect();
      spread();
    });
    waiting.observe(root, { attributes: true, attributeFilter: ['class'] });
    cleanups.push(() => waiting.disconnect());
  }
}

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  cleanups.forEach((cleanup) => cleanup());
});
</script>

<template>
  <canvas ref="canvas" class="hex-field" aria-hidden="true"></canvas>
</template>
