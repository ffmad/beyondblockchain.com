<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import type { Project } from '@beyond/shared';
import ArrowIcon from './ArrowIcon.vue';
import ProjectDetail from './ProjectDetail.vue';
import { useRouter } from 'vue-router';
import { useLocale } from '../i18n';
import { morphStyle, morphing } from '../composables/useProjectOverlay';
import { animations, fadeOut, reduceMotion, riseIn } from '../composables/windowMotion';

// The studio page's project window: a native modal dialog, so the page behind can't be reached and Escape
// closes it. It follows the address: the page turns opening, stepping and closing into history moves.
const props = defineProps<{ project: Project | null; projects: Project[] }>();
const emit = defineEmits<{ close: []; step: [slug: string] }>();
const { t } = useLocale();
const router = useRouter();
const workHref = (slug: string) => router.resolve(`/work/${slug}`).href;
const dialog = ref<HTMLDialogElement | null>(null);
// The content stays in place while the window closes.
const shown = shallowRef<Project | null>(props.project);
const swapped = ref(false);
const direction = ref(1);
const count = computed(() => props.projects.length);
const index = computed(() => props.projects.findIndex((p) => p.slug === shown.value?.slug));
const neighbour = (offset: number) =>
  props.projects[(index.value + offset + count.value) % count.value]!;
const prev = computed(() => neighbour(-1));
const next = computed(() => neighbour(1));
const pad = (n: number) => String(n).padStart(2, '0');
let opener: HTMLElement | null = null;
let closing: Animation | undefined;

function open(project: Project) {
  const element = dialog.value;
  if (!element) return;
  shown.value = project;
  if (closing) {
    // Reopened while closing: stay open.
    closing = undefined;
    animations(element).forEach((a) => a.cancel());
  }
  if (element.open) return;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  element.showModal();
  // Growing out of its card, the window needs no entrance of its own.
  if (!reduceMotion() && !morphing.value) riseIn(element);
}

async function close() {
  const element = dialog.value;
  if (!element?.open) return;
  if (!reduceMotion() && !morphing.value) {
    const fade = fadeOut(element);
    closing = fade;
    await fade.finished.catch(() => undefined);
    if (closing !== fade) return;
    closing = undefined;
  }
  element.close();
  animations(element).forEach((a) => a.cancel());
  swapped.value = false;
  opener?.focus({ preventScroll: true });
  opener = null;
}

watch(
  () => props.project,
  async (project, old) => {
    if (!project) return close();
    const stepping = !!dialog.value?.open && !!old && old.slug !== project.slug;
    if (stepping) {
      const from = props.projects.findIndex((p) => p.slug === old.slug);
      const to = props.projects.findIndex((p) => p.slug === project.slug);
      direction.value = (to - from + count.value) % count.value === 1 ? 1 : -1;
      swapped.value = true;
    }
    open(project);
    if (stepping) {
      await nextTick();
      dialog.value?.scrollTo({ top: 0 });
    }
  },
);
onMounted(() => {
  if (props.project) open(props.project);
});

// Escape and clicks outside the window ask the page to close it, so the address follows.
function onCancel(event: Event) {
  event.preventDefault();
  emit('close');
}
function onClosed() {
  if (props.project) emit('close');
}
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('close');
}
function onStep(event: MouseEvent, slug: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  emit('step', slug);
}

// The arrow keys step between projects, except while typing or with a modifier held.
function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || count.value < 2) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const target = event.target as HTMLElement;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
  event.preventDefault();
  emit('step', (event.key === 'ArrowRight' ? next : prev).value.slug);
}

// On touch screens a quick sideways swipe steps too, except on the screenshots, which scroll sideways.
let swipe: { x: number; y: number; time: number } | null = null;
function onPointerDown(event: PointerEvent) {
  const onGallery = (event.target as HTMLElement).closest('.detail-gallery');
  swipe =
    event.pointerType === 'touch' && !onGallery
      ? { x: event.clientX, y: event.clientY, time: performance.now() }
      : null;
}
function onPointerUp(event: PointerEvent) {
  if (!swipe || count.value < 2) return;
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  const quick = performance.now() - swipe.time < 600;
  swipe = null;
  if (quick && Math.abs(dx) > 70 && Math.abs(dx) > 1.6 * Math.abs(dy))
    emit('step', (dx < 0 ? next : prev).value.slug);
}
</script>

<template>
  <dialog
    ref="dialog"
    class="project-dialog"
    :style="morphStyle(shown?.slug, 'window')"
    aria-labelledby="project-dialog-title"
    @cancel="onCancel"
    @close="onClosed"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div
      v-if="shown"
      class="dialog-panel"
      :style="{ '--swap': direction }"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="swipe = null"
    >
      <div class="dialog-bar">
        <div class="dialog-nav">
          <a
            v-if="count > 1"
            class="dialog-arrow"
            :href="workHref(prev.slug)"
            :aria-label="t('project.previousProject', { name: prev.name })"
            @click="onStep($event, prev.slug)"
            ><ArrowIcon direction="left"
          /></a>
          <span class="dialog-count">{{ pad(index + 1) }} / {{ pad(count) }}</span>
          <a
            v-if="count > 1"
            class="dialog-arrow"
            :href="workHref(next.slug)"
            :aria-label="t('project.nextProject', { name: next.name })"
            @click="onStep($event, next.slug)"
            ><ArrowIcon direction="right"
          /></a>
        </div>
        <button type="button" class="dialog-close" @click="emit('close')">
          <span class="sr-only">{{ t('project.close') }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <ProjectDetail
        :key="shown.slug"
        :class="{ 'is-swapped': swapped }"
        :project="shown"
        morph
        heading="h2"
        heading-id="project-dialog-title"
      />
      <nav v-if="count > 1" class="dialog-steps" :aria-label="t('project.others')">
        <a class="dialog-step" :href="workHref(prev.slug)" @click="onStep($event, prev.slug)"
          ><ArrowIcon direction="left" /><img
            v-if="prev.logoUrl"
            class="dialog-step-logo"
            :src="prev.logoUrl"
            alt=""
            width="36"
            height="36"
          /><span
            ><small>{{ t('project.previous') }}</small
            >{{ prev.name }}</span
          ></a
        >
        <a
          class="dialog-step is-next"
          :href="workHref(next.slug)"
          @click="onStep($event, next.slug)"
          ><span
            ><small>{{ t('project.next') }}</small
            >{{ next.name }}</span
          ><img
            v-if="next.logoUrl"
            class="dialog-step-logo"
            :src="next.logoUrl"
            alt=""
            width="36"
            height="36" /><ArrowIcon direction="right"
        /></a>
      </nav>
    </div>
  </dialog>
</template>
