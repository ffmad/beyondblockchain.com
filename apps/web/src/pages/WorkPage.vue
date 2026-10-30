<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Project } from '@beyond/shared';
import { contentPath } from '@beyond/shared/metadata.js';
import { useLocale } from '../i18n';
import { useResource } from '../composables/useResource';
import { useProjectDirectory } from '../composables/useProjectDirectory';
import { applyPageMetadata } from '../page-metadata';
import ArrowIcon from '../components/ArrowIcon.vue';
import ProjectDetail from '../components/ProjectDetail.vue';
import ResourceState from '../components/ResourceState.vue';
import NotFoundPage from './NotFoundPage.vue';

// A project's own page, for shared links and refreshes. From the studio page, projects open in a window instead.
const route = useRoute();
const { t, locale } = useLocale();
const { data, loading, error, reload } = useResource<Project[]>(
  contentPath('/api/projects', locale),
);
const directory = useProjectDirectory();
watch(data, (list) => {
  if (list) directory.value = list;
});
// Only products have a page of their own; prev and next step through them.
const projects = computed(
  () => (data.value ?? directory.value)?.filter((p) => p.kind === 'product') ?? null,
);
const slug = computed(() => String(route.params.slug ?? ''));
const index = computed(() => projects.value?.findIndex((p) => p.slug === slug.value) ?? -1);
const project = computed(() => (index.value >= 0 ? projects.value![index.value]! : null));
const count = computed(() => projects.value?.length ?? 0);
const neighbour = (offset: number) =>
  projects.value![(index.value + offset + count.value) % count.value]!;
const prev = computed(() => neighbour(-1));
const next = computed(() => neighbour(1));
const pad = (n: number) => String(n).padStart(2, '0');

// A page reached before the project list was known gets its title once the list arrives.
watch(project, (value, old) => {
  if (value && !old && typeof document !== 'undefined')
    applyPageMetadata(route.path, projects.value, locale);
});
</script>

<template>
  <div v-if="project" class="work-page wrap">
    <nav class="work-bar" :aria-label="t('project.nav')">
      <RouterLink class="work-all" to="/#projects"
        ><ArrowIcon direction="left" /> {{ t('project.all') }}</RouterLink
      >
      <div v-if="count > 1" class="work-steps">
        <RouterLink
          :to="`/work/${prev.slug}`"
          class="work-step"
          :aria-label="t('project.previousProject', { name: prev.name })"
          ><ArrowIcon direction="left"
        /></RouterLink>
        <span class="work-count">{{ pad(index + 1) }} / {{ pad(count) }}</span>
        <RouterLink
          :to="`/work/${next.slug}`"
          class="work-step"
          :aria-label="t('project.nextProject', { name: next.name })"
          ><ArrowIcon direction="right"
        /></RouterLink>
      </div>
    </nav>
    <ProjectDetail
      :key="project.slug"
      :project="project"
      heading="h1"
      :heading-id="`work-${project.slug}`"
    />
  </div>
  <div v-else-if="!projects" class="wrap work-loading">
    <ResourceState
      :loading="loading"
      :error="error"
      :label="t('project.loadLabel')"
      @retry="reload"
    />
  </div>
  <NotFoundPage v-else />
</template>
