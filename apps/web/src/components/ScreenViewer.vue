<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { ProjectScreen } from '../content/project-screens';
import ArrowIcon from './ArrowIcon.vue';
import { useLocale } from '../i18n';

// A project's real screens at full size, one at a time: arrows, the arrow keys or a sideways swipe move between
// them; Escape, the close button, a tap outside the screen or a swipe down close it. It opens above the project
// window when there is one, and gives focus back to the screen that opened it.
const props = defineProps<{ screens: ProjectScreen[]; index: number | null; name: string }>();
const emit = defineEmits<{ close: []; change: [index: number] }>();
const { t } = useLocale();
const dialog = ref<HTMLDialogElement | null>(null);
const current = computed(() => (props.index === null ? null : props.screens[props.index]));
const count = computed(() => props.screens.length);
let opener: HTMLElement | null = null;

watch(
  () => props.index,
  async (index) => {
    const element = dialog.value;
    if (!element) return;
    if (index !== null && !element.open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      element.showModal();
    } else if (index === null && element.open) {
      element.close();
      await nextTick();
      opener?.focus({ preventScroll: true });
      opener = null;
    }
  },
);

const move = (offset: number) => {
  if (props.index === null || count.value < 2) return;
  emit('change', (props.index + offset + count.value) % count.value);
};

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  // The project window behind uses the same keys to change project.
  event.stopPropagation();
  event.preventDefault();
  move(event.key === 'ArrowRight' ? 1 : -1);
}
function onCancel(event: Event) {
  event.preventDefault();
  emit('close');
}
function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target === dialog.value || target.classList.contains('viewer-stage')) emit('close');
}

let start: { x: number; y: number; time: number } | null = null;
function onPointerDown(event: PointerEvent) {
  start = { x: event.clientX, y: event.clientY, time: performance.now() };
}
function onPointerUp(event: PointerEvent) {
  if (!start || event.pointerType === 'mouse') return (start = null);
  const dx = event.clientX - start.x;
  const dy = event.clientY - start.y;
  const quick = performance.now() - start.time < 700;
  start = null;
  if (!quick) return;
  if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) move(dx < 0 ? 1 : -1);
  else if (dy > 90 && dy > 1.5 * Math.abs(dx)) emit('close');
}
</script>

<template>
  <dialog
    ref="dialog"
    class="screen-viewer"
    :aria-label="t('project.screens', { name })"
    @cancel="onCancel"
    @click="onClick"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
  >
    <div v-if="current" class="viewer-stage">
      <figure class="viewer-figure">
        <img
          :key="current.src"
          :class="{ 'is-phone': current.phone }"
          :src="current.src"
          :alt="current.alt"
          :width="current.width"
          :height="current.height"
        />
        <figcaption>
          <span v-if="count > 1" class="viewer-count">{{ (index ?? 0) + 1 }} / {{ count }}</span>
          {{ current.alt }}
        </figcaption>
      </figure>
    </div>
    <button type="button" class="viewer-button viewer-close" @click="emit('close')">
      <span class="sr-only">{{ t('project.close') }}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
    </button>
    <template v-if="count > 1">
      <button type="button" class="viewer-button viewer-prev" @click="move(-1)">
        <span class="sr-only">{{ t('project.previousScreen') }}</span>
        <ArrowIcon direction="left" />
      </button>
      <button type="button" class="viewer-button viewer-next" @click="move(1)">
        <span class="sr-only">{{ t('project.nextScreen') }}</span>
        <ArrowIcon direction="right" />
      </button>
    </template>
  </dialog>
</template>
