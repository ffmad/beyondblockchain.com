<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Project } from '@beyond/shared';
import { contentPath } from '@beyond/shared/metadata.js';
import { useLocale } from '../i18n';
import { useResource } from '../composables/useResource';
import { usePageAnchor } from '../composables/usePageAnchor';
import { useProjectDirectory } from '../composables/useProjectDirectory';
import { morphStyle, overStudio, useProjectOverlay } from '../composables/useProjectOverlay';
import { projectClip, projectHost, projectScreens } from '../content/project-screens';
import ResourceState from '../components/ResourceState.vue';
import ArrowIcon from '../components/ArrowIcon.vue';
import ProjectDialog from '../components/ProjectDialog.vue';
import StackExplorer from '../components/StackExplorer.vue';
import HexField from '../components/HexField.vue';
import CardClip from '../components/CardClip.vue';

const { t, locale } = useLocale();
const { data, loading, error, reload } = useResource<Project[]>(
  contentPath('/api/projects', locale),
);
const directory = useProjectDirectory();
watch(data, (list) => {
  if (list) directory.value = list;
});
// The list the visitor already has stands in while it refreshes, so returning never blanks the page.
const projects = computed(() => data.value ?? directory.value);
usePageAnchor(projects);

// Products get cards and a window; experiments and earlier work are listed more briefly.
const ofKind = (kind: Project['kind']) => projects.value?.filter((p) => p.kind === kind) ?? [];
const products = computed(() => ofKind('product'));
const experiments = computed(() => ofKind('experiment'));
const earlier = computed(() => ofKind('earlier'));

const hero = ref<HTMLElement | null>(null);
const cover = (project: Project) => projectScreens(project, t)[0] ?? null;
const platformNames: Record<string, string> = { web: 'Web', ios: 'iOS', android: 'Android' };
const availability = (project: Project) =>
  [
    project.platforms.map((platform) => platformNames[platform] ?? platform).join(' · '),
    project.languages.length > 4
      ? t('studio.languagesCount', { n: project.languages.length })
      : project.languages.map((language) => language.toUpperCase()).join(' · '),
  ].filter(Boolean);
const STACK_SHOWN = 4;
const years = (project: Project) =>
  project.endedYear
    ? t('studio.years', { from: project.startedYear, to: project.endedYear })
    : t('studio.since', { year: project.startedYear });

// A product opens in a window over this page, at its own address: Back or Escape closes it.
const route = useRoute();
const router = useRouter();
const overlay = useProjectOverlay();
const workHref = (slug: string) => router.resolve(`/work/${slug}`).href;
const openSlug = computed(() =>
  overlay.value && route.name === 'work' ? String(route.params.slug) : null,
);
const openProject = computed(() => products.value.find((p) => p.slug === openSlug.value) ?? null);
const modified = (event: MouseEvent) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

function show(slug: string) {
  void router.push({ path: `/work/${slug}`, state: overStudio });
}
function open(event: MouseEvent, slug: string) {
  if (modified(event)) return;
  event.preventDefault();
  show(slug);
}
function step(slug: string) {
  void router.replace({ path: `/work/${slug}`, state: overStudio });
}
function close() {
  const back = window.history.state?.back;
  if (typeof back === 'string' && back.split(/[?#]/)[0] === '/') router.back();
  else void router.replace('/');
}
// An address for something that isn't a product (or no longer exists) closes the window.
watch(
  () => [openSlug.value, projects.value] as const,
  ([slug, list]) => {
    if (slug && list && !products.value.some((p) => p.slug === slug)) void router.replace('/');
  },
);

// Links to the old project sections (/#work-fairmints) open the project's page.
onMounted(() => {
  const slug = window.location.hash.match(/^#work-([\w-]+)$/)?.[1];
  if (slug) void router.replace(`/work/${slug}`);
});
</script>

<template>
  <div class="studio-page">
    <HexField :hero="hero" />
    <section ref="hero" class="studio-hero wrap" aria-labelledby="studio-title">
      <h1 id="studio-title" class="masthead">Beyond Blockchain</h1>
      <p class="studio-tagline">{{ t('studio.tagline') }}</p>
      <i18n-t keypath="studio.lead" tag="p" class="studio-lead" scope="global">
        <template #name><RouterLink to="/quentin">Quentin de Beauchesne</RouterLink></template>
      </i18n-t>
    </section>

    <section id="projects" class="projects wrap" aria-labelledby="projects-title">
      <div class="section-head">
        <h2 id="projects-title">{{ t('studio.productsTitle') }}</h2>
      </div>
      <ResourceState
        v-if="!projects?.length"
        :loading="loading"
        :error="error"
        :label="t('studio.loadLabel')"
        @retry="reload"
      />
      <ul v-else class="project-grid">
        <li v-for="project in products" :key="project.slug">
          <article
            class="project-card"
            :style="[
              { '--language-name': `card-${project.slug}` },
              morphStyle(project.slug, 'window', !openProject),
            ]"
            :aria-labelledby="`card-${project.slug}`"
          >
            <span
              class="card-media"
              :style="morphStyle(project.slug, 'shot', !openProject)"
              :class="{ 'is-phone': cover(project)?.phone }"
              aria-hidden="true"
            >
              <img
                v-if="cover(project)"
                :src="cover(project)!.src"
                alt=""
                :width="cover(project)!.width"
                :height="cover(project)!.height"
                decoding="async"
              />
              <CardClip v-if="projectClip(project)" :src="projectClip(project)!.src" />
            </span>
            <div class="card-body">
              <div class="card-head">
                <img
                  v-if="project.logoUrl"
                  :style="morphStyle(project.slug, 'logo', !openProject)"
                  :src="project.logoUrl"
                  alt=""
                  width="32"
                  height="32"
                  loading="lazy"
                />
                <h3
                  :id="`card-${project.slug}`"
                  class="card-name"
                  :style="morphStyle(project.slug, 'name', !openProject)"
                >
                  <a
                    class="card-link"
                    :href="workHref(project.slug)"
                    @click="open($event, project.slug)"
                    >{{ project.name }}</a
                  >
                </h3>
                <span v-if="project.stage" class="card-stage" :class="`stage-${project.stage}`">{{
                  t(`studio.stage.${project.stage}`)
                }}</span>
              </div>
              <p class="card-summary">{{ project.summary }}</p>
              <p class="card-category">{{ project.category }} · {{ project.startedYear }}</p>
              <p v-if="availability(project).length" class="card-availability">
                <span v-for="item in availability(project)" :key="item">{{ item }}</span>
              </p>
              <ul v-if="project.stack.length" class="card-stack">
                <li v-for="tech in project.stack.slice(0, STACK_SHOWN)" :key="tech">{{ tech }}</li>
                <li
                  v-if="project.stack.length > STACK_SHOWN"
                  class="card-stack-more"
                  :title="project.stack.slice(STACK_SHOWN).join(', ')"
                >
                  <span aria-hidden="true">{{
                    t('studio.moreTech', { n: project.stack.length - STACK_SHOWN })
                  }}</span
                  ><span class="sr-only">{{
                    t('studio.moreTechLabel', { n: project.stack.length - STACK_SHOWN })
                  }}</span>
                </li>
              </ul>
              <div class="card-actions">
                <span class="card-more" aria-hidden="true"
                  >{{ t('studio.more') }} <ArrowIcon direction="right"
                /></span>
                <a
                  class="card-site"
                  :href="project.url"
                  :aria-label="t('studio.open', { host: projectHost(project) })"
                  >{{ projectHost(project) }} <ArrowIcon
                /></a>
              </div>
            </div>
          </article>
        </li>
      </ul>
    </section>

    <section v-if="experiments.length" class="experiments wrap" aria-labelledby="experiments-title">
      <div class="section-head">
        <h2 id="experiments-title">{{ t('studio.experimentsTitle') }}</h2>
        <p class="section-note">{{ t('studio.experimentsNote') }}</p>
      </div>
      <ul class="side-list">
        <li v-for="project in experiments" :key="project.slug" class="side-item">
          <span class="side-year">{{ project.startedYear }}</span>
          <div class="side-body">
            <h3>{{ project.name }}</h3>
            <p>{{ project.summary }} {{ project.description }}</p>
          </div>
          <p class="side-meta">
            <span>{{ project.category }}</span
            ><span class="side-stack">{{ project.stack.join(' · ') }}</span>
          </p>
        </li>
      </ul>
    </section>

    <section v-if="projects?.length" class="build wrap" aria-labelledby="build-title">
      <div class="section-head">
        <h2 id="build-title">{{ t('studio.buildTitle') }}</h2>
      </div>
      <p class="build-text">{{ t('studio.buildText') }}</p>
      <StackExplorer :projects="projects" @open="show" />
    </section>

    <section v-if="earlier.length" class="earlier wrap" aria-labelledby="earlier-title">
      <div class="section-head">
        <h2 id="earlier-title">{{ t('studio.earlierTitle') }}</h2>
        <p class="section-note">{{ t('studio.earlierNote') }}</p>
      </div>
      <ol class="earlier-list">
        <li v-for="project in earlier" :key="project.slug" class="earlier-item">
          <span class="earlier-years">{{ years(project) }}</span>
          <div class="earlier-body">
            <h3>
              <a v-if="project.url" :href="project.url">{{ project.name }} <ArrowIcon /></a
              ><template v-else>{{ project.name }}</template>
              <span v-if="project.role" class="earlier-role">{{ project.role }}</span>
            </h3>
            <p>{{ project.description }}</p>
          </div>
        </li>
      </ol>
      <RouterLink class="text-link earlier-story" to="/quentin"
        >{{ t('studio.story') }} <ArrowIcon direction="right"
      /></RouterLink>
    </section>

    <ProjectDialog
      v-if="products.length"
      :project="openProject"
      :projects="products"
      @close="close"
      @step="step"
    />
  </div>
</template>
