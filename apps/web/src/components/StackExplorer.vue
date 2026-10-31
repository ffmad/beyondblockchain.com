<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Project } from '@beyond/shared';
import ArrowIcon from './ArrowIcon.vue';
import TechIcon from './TechIcon.vue';
import { useLocale } from '../i18n';
import { techIcon, techWhat } from '../content/technologies';
import type { StackScene } from './stack-scene';

// "How I build": every technology across the projects, most-used first; picking one shows where it's used. The
// list and its result are the whole interface on the server, without WebGL and from the keyboard. In the browser
// a Three.js globe of the same technologies joins them (loaded on demand), and the two stay in step.
const props = defineProps<{ projects: Project[] }>();
const emit = defineEmits<{ open: [slug: string] }>();
const { t, locale } = useLocale();
const router = useRouter();
const resultId = useId();

interface Technology {
  name: string;
  projects: Project[];
}
const kindRank: Record<Project['kind'], number> = {
  product: 0,
  experiment: 1,
  other: 2,
  earlier: 3,
};

const technologies = computed<Technology[]>(() => {
  const byName = new Map<string, Project[]>();
  for (const project of props.projects) {
    const names = new Set((project.stack ?? []).map((tech) => tech.trim()).filter(Boolean));
    for (const name of names) {
      const list = byName.get(name);
      if (list) list.push(project);
      else byName.set(name, [project]);
    }
  }
  // Most-used first. Ties keep the order they first appear in, which follows the projects' own order.
  return [...byName]
    .map(([name, list]) => ({
      name,
      projects: list.sort((a, b) => (kindRank[a.kind] ?? 0) - (kindRank[b.kind] ?? 0)),
    }))
    .sort((a, b) => b.projects.length - a.projects.length);
});

// Something is always picked, so the result is never empty: the most-used technology to begin with.
const chosen = ref<string | null>(null);
const selected = computed(
  () =>
    technologies.value.find((tech) => tech.name === chosen.value) ?? technologies.value[0] ?? null,
);
const related = computed(() => {
  const slugs = new Set(selected.value?.projects.map((project) => project.slug));
  return new Set(
    technologies.value
      .filter(
        (tech) =>
          tech !== selected.value && tech.projects.some((project) => slugs.has(project.slug)),
      )
      .map((tech) => tech.name),
  );
});
/** The technology under the pointer on the globe. */
const hovered = ref<string | null>(null);

function pick(name: string) {
  chosen.value = name;
}

// The list is one stop for Tab; the arrow keys move between technologies.
const focused = ref<string | null>(null);
const tabStop = computed(
  () =>
    technologies.value.find((tech) => tech.name === focused.value)?.name ?? selected.value?.name,
);
const list = ref<HTMLElement | null>(null);

function chips() {
  return [...(list.value?.querySelectorAll<HTMLButtonElement>('.stack-chip') ?? [])];
}

function onKeydown(event: KeyboardEvent) {
  const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
  const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
  if (!forward && !back && event.key !== 'Home' && event.key !== 'End') return;
  const buttons = chips();
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (index < 0) return;
  event.preventDefault();
  const last = buttons.length - 1;
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? last
        : forward
          ? Math.min(last, index + 1)
          : Math.max(0, index - 1);
  buttons[next]?.focus();
}

function onChipFocus(name: string) {
  focused.value = name;
  hint(name);
}

/** On phones the list scrolls sideways: keep the picked technology in view. */
function reveal(name: string) {
  const scroller = list.value;
  if (!scroller || scroller.scrollWidth <= scroller.clientWidth + 1) return;
  const chip = chips().find((button) => button.dataset.tech === name);
  if (!chip) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scroller.scrollTo({
    left: chip.offsetLeft - (scroller.clientWidth - chip.offsetWidth) / 2,
    behavior: reduce ? 'auto' : 'smooth',
  });
}

// The projects
const workHref = (slug: string) => router.resolve(`/work/${slug}`).href;

function onOpen(event: MouseEvent, slug: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  emit('open', slug);
}

function years(project: Project) {
  const { startedYear: from, endedYear: to } = project;
  if (!to) return t('stack.since', { year: from });
  return to === from ? String(from) : t('stack.span', { from, to });
}

function meta(project: Project) {
  return t('stack.meta', { kind: t(`stack.kind.${project.kind}`), years: years(project) });
}

// The globe: only in the browser, only with WebGL, and only once the page is interactive.
const stage = ref<HTMLElement | null>(null);
const flat = ref(false);
const ready = ref(false);
const touch = ref(false);
let scene: StackScene | null = null;
let generation = 0;
let unmounted = false;

function hasWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

async function mountScene() {
  const token = ++generation;
  scene?.dispose();
  scene = null;
  const element = stage.value;
  if (!element || !technologies.value.length) return;
  try {
    const { createStackScene } = await import('./stack-scene');
    if (unmounted || token !== generation || stage.value !== element) return;
    scene = createStackScene(element, {
      technologies: technologies.value.map((tech) => ({
        name: tech.name,
        projects: tech.projects.map((project) => project.slug),
        icon: techIcon(tech.name),
      })),
      selected: selected.value?.name ?? null,
      onPick: pick,
      onHover: (name) => {
        hovered.value = name;
      },
    });
    ready.value = true;
  } catch {
    // No globe, then: the list does everything.
    scene = null;
    flat.value = true;
  }
}

function hint(name: string | null) {
  scene?.hover(name);
}

watch(
  () => selected.value?.name,
  (name) => {
    scene?.select(name ?? null);
    if (name) reveal(name);
  },
);

// New data (another language, a new project) gets a new globe.
const signature = computed(() =>
  technologies.value
    .map((tech) => `${tech.name}:${tech.projects.map((project) => project.slug).join(',')}`)
    .join('|'),
);
watch(
  signature,
  () => {
    if (!flat.value && (scene || ready.value || stage.value)) void mountScene();
  },
  { flush: 'post' },
);

onMounted(() => {
  touch.value = window.matchMedia('(pointer: coarse)').matches;
  if (!hasWebGL()) {
    flat.value = true;
    return;
  }
  void mountScene();
});
onBeforeUnmount(() => {
  unmounted = true;
  scene?.dispose();
  scene = null;
});
</script>

<template>
  <div
    v-if="technologies.length"
    class="stack-explorer"
    :class="{ 'is-flat': flat, 'is-ready': ready }"
  >
    <div v-if="!flat" class="stack-visual" aria-hidden="true">
      <div ref="stage" class="stack-stage"></div>
      <p class="stack-hint">{{ ready ? t(touch ? 'stack.hintTouch' : 'stack.hint') : '' }}</p>
    </div>

    <div
      class="stack-list"
      role="toolbar"
      :aria-label="t('stack.technologies')"
      @keydown="onKeydown"
    >
      <ul ref="list">
        <li v-for="tech in technologies" :key="tech.name">
          <button
            type="button"
            class="stack-chip"
            :class="{ 'is-related': related.has(tech.name), 'is-hovered': hovered === tech.name }"
            :aria-pressed="tech.name === selected?.name"
            :aria-controls="resultId"
            :tabindex="tech.name === tabStop ? 0 : -1"
            :data-tech="tech.name"
            @click="pick(tech.name)"
            @focus="onChipFocus(tech.name)"
            @blur="hint(null)"
            @pointerenter="hint(tech.name)"
            @pointerleave="hint(null)"
          >
            <TechIcon :name="tech.name" />
            <span>{{ tech.name }}</span>
            <span class="stack-chip-count" aria-hidden="true">{{ tech.projects.length }}</span>
            <span class="sr-only"
              >{{ t('listSeparator')
              }}{{ t('stack.projects', { n: tech.projects.length }, tech.projects.length) }}</span
            >
          </button>
        </li>
      </ul>
    </div>

    <div :id="resultId" class="stack-result" aria-live="polite">
      <div v-if="selected" :key="selected.name" class="stack-result-body">
        <p class="stack-result-count">
          {{ t('stack.usedIn', { n: selected.projects.length }, selected.projects.length) }}
        </p>
        <div class="stack-result-title">
          <span class="stack-result-icon"><TechIcon :name="selected.name" /></span>
          <h3 class="stack-result-name">{{ selected.name }}</h3>
        </div>
        <p v-if="techWhat(selected.name, locale)" class="stack-result-what">
          {{ techWhat(selected.name, locale) }}
        </p>
        <ul class="stack-projects">
          <li v-for="project in selected.projects" :key="project.slug">
            <a
              v-if="project.kind === 'product'"
              class="stack-project is-product"
              :href="workHref(project.slug)"
              @click="onOpen($event, project.slug)"
            >
              <img
                v-if="project.logoUrl"
                class="stack-project-logo"
                :src="project.logoUrl"
                alt=""
                width="32"
                height="32"
                loading="lazy"
              />
              <span v-else class="stack-project-logo" aria-hidden="true"></span>
              <span class="stack-project-text">
                <strong>{{ project.name }}</strong>
                <small>{{ meta(project) }}</small>
              </span>
              <ArrowIcon direction="right" />
            </a>
            <div v-else class="stack-project">
              <img
                v-if="project.logoUrl"
                class="stack-project-logo"
                :src="project.logoUrl"
                alt=""
                width="32"
                height="32"
                loading="lazy"
              />
              <span v-else class="stack-project-logo" aria-hidden="true"></span>
              <span class="stack-project-text">
                <strong>{{ project.name }}</strong>
                <small>{{ meta(project) }}</small>
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
