<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import type { Project } from '@beyond/shared';
import ArrowIcon from './ArrowIcon.vue';
import TechIcon from './TechIcon.vue';
import { useLocale } from '../i18n';
import { PREVIEW_SIZE, projectHost, projectPreview } from '../content/project-screens';
import { animations, fadeOut, reduceMotion, riseIn } from '../composables/windowMotion';

// A project in progress or another project, in a window over the studio page: its preview playing, what it is,
// the part I played and what it's built with. Unlike a product it has no page of its own, so the window doesn't
// change the address; Escape, the close button or a click outside close it, and the arrows step between the
// projects of its group, which `label` names.
const props = defineProps<{ project: Project | null; projects: Project[]; label: string }>();
const emit = defineEmits<{ close: []; step: [slug: string] }>();
const { t } = useLocale();
const dialog = ref<HTMLDialogElement | null>(null);
const video = ref<HTMLVideoElement | null>(null);
const paused = ref(true);
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
const preview = computed(() => shown.value && projectPreview(shown.value, t));
const pad = (n: number) => String(n).padStart(2, '0');
// When it started, the part I played and who it's for.
const facts = computed(() =>
  shown.value
    ? [
        t('project.since', { year: shown.value.startedYear }),
        shown.value.role,
        shown.value.audience,
      ].filter((fact): fact is string => !!fact)
    : [],
);
let opener: HTMLElement | null = null;
let closing: Animation | undefined;

// The preview plays as the window opens, unless the visitor prefers less motion or saves data: then it waits,
// showing its first frame, for the play button.
function stillOnly() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  return !!saveData || reduceMotion();
}
watch(video, (element) => {
  if (element && !stillOnly()) element.play().catch(() => undefined);
});
function toggle() {
  const element = video.value;
  if (!element) return;
  if (element.paused) element.play().catch(() => undefined);
  else element.pause();
}

function open(project: Project) {
  const element = dialog.value;
  if (!element) return;
  shown.value = project;
  if (closing) {
    closing = undefined;
    animations(element).forEach((a) => a.cancel());
  }
  if (element.open) return;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  element.showModal();
  if (!reduceMotion()) riseIn(element);
}

async function close() {
  const element = dialog.value;
  if (!element?.open) return;
  video.value?.pause();
  if (!reduceMotion()) {
    const fade = fadeOut(element);
    closing = fade;
    await fade.finished.catch(() => undefined);
    if (closing !== fade) return;
    closing = undefined;
  }
  element.close();
  animations(element).forEach((a) => a.cancel());
  swapped.value = false;
  shown.value = null;
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

function onCancel(event: Event) {
  event.preventDefault();
  emit('close');
}
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('close');
}
// The arrow keys step between projects, except with a modifier held.
function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || count.value < 2) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  emit('step', (event.key === 'ArrowRight' ? next : prev).value.slug);
}
</script>

<template>
  <dialog
    ref="dialog"
    class="project-dialog preview-dialog"
    aria-labelledby="preview-dialog-title"
    @cancel="onCancel"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div v-if="shown" class="dialog-panel" :style="{ '--swap': direction }">
      <div class="dialog-bar">
        <div class="dialog-nav">
          <button
            v-if="count > 1"
            type="button"
            class="dialog-arrow"
            :aria-label="t('project.previousProject', { name: prev.name })"
            @click="emit('step', prev.slug)"
          >
            <ArrowIcon direction="left" />
          </button>
          <span class="dialog-count">{{ pad(index + 1) }} / {{ pad(count) }}</span>
          <button
            v-if="count > 1"
            type="button"
            class="dialog-arrow"
            :aria-label="t('project.nextProject', { name: next.name })"
            @click="emit('step', next.slug)"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
        <button type="button" class="dialog-close" @click="emit('close')">
          <span class="sr-only">{{ t('project.close') }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <article
        :key="shown.slug"
        class="project-detail preview-detail"
        :class="{ 'is-swapped': swapped }"
        aria-labelledby="preview-dialog-title"
      >
        <header class="detail-head">
          <img
            v-if="shown.logoUrl"
            class="detail-logo"
            :src="shown.logoUrl"
            alt=""
            width="56"
            height="56"
          />
          <div>
            <p class="detail-category">{{ shown.category }}</p>
            <h2 id="preview-dialog-title" class="detail-name">{{ shown.name }}</h2>
          </div>
          <span v-if="shown.stage" class="card-stage" :class="`stage-${shown.stage}`">{{
            t(`studio.stage.${shown.stage}`)
          }}</span>
        </header>
        <p class="detail-summary">{{ shown.summary }}</p>
        <p class="detail-facts">
          <span v-for="fact in facts" :key="fact">{{ fact }}</span>
        </p>

        <figure v-if="preview" class="preview-media">
          <div class="preview-clip">
            <video
              ref="video"
              :src="preview.src"
              :poster="preview.poster"
              :width="PREVIEW_SIZE.width"
              :height="PREVIEW_SIZE.height"
              muted
              loop
              playsinline
              disablepictureinpicture
              preload="metadata"
              :aria-label="preview.alt"
              @play="paused = false"
              @pause="paused = true"
            ></video>
            <button type="button" class="clip-toggle" @click="toggle">
              <span class="sr-only">{{
                paused ? t('project.playClip') : t('project.pauseClip')
              }}</span>
              <svg v-if="paused" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4.5 2.5v11l9-5.5z" />
              </svg>
              <svg v-else viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 2.5h2.6v11H4zM9.4 2.5H12v11H9.4z" />
              </svg>
            </button>
          </div>
          <figcaption class="detail-caption">{{ preview.alt }}</figcaption>
        </figure>

        <div class="detail-body">
          <p class="detail-description">{{ shown.description }}</p>
          <div class="detail-aside">
            <div v-if="shown.stack.length" class="detail-stack">
              <p class="eyebrow">{{ t('project.builtWith') }}</p>
              <ul>
                <li v-for="tech in shown.stack" :key="tech"><TechIcon :name="tech" />{{ tech }}</li>
              </ul>
            </div>
            <a v-if="shown.url" class="button button-dark detail-visit" :href="shown.url"
              >{{ t('project.visit', { host: projectHost(shown) }) }} <ArrowIcon
            /></a>
          </div>
        </div>
      </article>

      <nav v-if="count > 1" class="dialog-steps" :aria-label="label">
        <button type="button" class="dialog-step" @click="emit('step', prev.slug)">
          <ArrowIcon direction="left" /><img
            v-if="prev.logoUrl"
            class="dialog-step-logo"
            :src="prev.logoUrl"
            alt=""
            width="36"
            height="36"
          /><span
            ><small>{{ t('project.previous') }}</small
            >{{ prev.name }}</span
          >
        </button>
        <button type="button" class="dialog-step is-next" @click="emit('step', next.slug)">
          <span
            ><small>{{ t('project.next') }}</small
            >{{ next.name }}</span
          ><img
            v-if="next.logoUrl"
            class="dialog-step-logo"
            :src="next.logoUrl"
            alt=""
            width="36"
            height="36"
          /><ArrowIcon direction="right" />
        </button>
      </nav>
    </div>
  </dialog>
</template>
