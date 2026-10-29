<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import type { Project } from '@beyond/shared';
import { useResource } from '../composables/useResource';
import { usePageAnchor } from '../composables/usePageAnchor';
import ResourceState from '../components/ResourceState.vue';
import ArrowIcon from '../components/ArrowIcon.vue';
import BrandMark from '../components/BrandMark.vue';
import ProjectChapter from '../components/ProjectChapter.vue';

const { data: projects, loading, error, reload } = useResource<Project[]>('/api/projects');
usePageAnchor(projects);
// The block entrance is opt-in until it wins a side-by-side comparison: /?entrance=on.
const entrance = useRoute().query.entrance === 'on';

const find = (slug: string | null) =>
  projects.value?.find((p) => p.slug === slug) ?? projects.value?.[0] ?? null;
// The picker answers at once; the stage switches when the incoming screen has decoded.
const requestedSlug = ref<string | null>(null);
const shownSlug = ref<string | null>(null);
const requested = computed(() => find(requestedSlug.value));
const shown = computed(() => find(shownSlug.value));
// The outgoing screen stays underneath while the new one is revealed along the rocket's diagonal.
const previous = shallowRef<Project | null>(null);
const screen = ref<HTMLImageElement | null>(null);
const sweeping = ref(false);
let reveal: Animation | undefined;
let request = 0;

function heroScreen(project: Project) {
  if (project.slug === 'ikitai' || !project.mobileImageUrl)
    return {
      src: project.imageUrl ?? '',
      width: 1320,
      height: 2868,
      alt: project.imageAlt ?? `${project.name} app screen`,
    };
  return {
    src: project.mobileImageUrl,
    width: 390,
    height: 844,
    alt: `${project.name} on a phone. ${project.imageAlt ?? ''}`.trim(),
  };
}

async function select(slug: string) {
  const next = find(slug);
  if (!next || next.slug === requested.value?.slug) return;
  requestedSlug.value = slug;
  const ticket = ++request;
  const probe = new Image();
  probe.src = heroScreen(next).src;
  // A failed load still switches, so the alt text and caption take over instead of a stale screen.
  await probe.decode().catch(() => undefined);
  if (ticket !== request) return;
  reveal?.cancel();
  previous.value = shown.value;
  shownSlug.value = slug;
  await nextTick();
  const element = screen.value;
  if (!element?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    previous.value = null;
    return;
  }
  sweeping.value = false;
  requestAnimationFrame(() => (sweeping.value = true));
  const animation = element.animate(
    [
      { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%)' },
      { clipPath: 'polygon(0% 100%, 220% 100%, 0% -120%)' },
    ],
    { duration: 820, easing: 'cubic-bezier(.7,0,.2,1)' },
  );
  reveal = animation;
  const done = () => {
    if (ticket === request) previous.value = null;
  };
  animation.finished.then(done, done);
}
onBeforeUnmount(() => {
  request++;
  reveal?.cancel();
});

function chapterLink(project: Project) {
  return project.slug === 'ikitai' ? 'See how it works' : `More about ${project.name}`;
}
</script>

<template>
  <div class="studio-page">
    <section class="studio-hero" aria-labelledby="studio-title">
      <div class="hero-grid wrap">
        <h1 id="studio-title" class="masthead"><span>Beyond</span> <span>Blockchain</span></h1>
        <p class="studio-lead">
          A one-person development studio. Blockchain, AI and useful software, built by
          <RouterLink to="/quentin">Quentin de Beauchesne</RouterLink>.
        </p>

        <div class="aperture">
          <BrandMark class="aperture-mark" :entrance="entrance" />
          <span
            class="aperture-beam"
            :class="{ sweeping }"
            aria-hidden="true"
            @animationend="sweeping = false"
          ></span>
          <figure v-if="shown" class="aperture-stage">
            <div class="stage-phone">
              <img
                v-if="previous"
                :key="`previous-${previous.slug}`"
                class="stage-screen"
                :src="heroScreen(previous).src"
                alt=""
                :width="heroScreen(previous).width"
                :height="heroScreen(previous).height"
              />
              <img
                ref="screen"
                :key="shown.slug"
                class="stage-screen"
                :src="heroScreen(shown).src"
                :alt="heroScreen(shown).alt"
                :width="heroScreen(shown).width"
                :height="heroScreen(shown).height"
                fetchpriority="high"
              />
            </div>
            <figcaption>{{ shown.imageCaption }}</figcaption>
          </figure>
        </div>

        <div v-if="projects?.length && requested" class="picker">
          <p id="picker-label" class="eyebrow">Current work</p>
          <div class="picker-list" role="group" aria-labelledby="picker-label">
            <button
              v-for="project in projects"
              :key="project.slug"
              type="button"
              class="picker-item"
              :class="`picker-${project.slug}`"
              :aria-pressed="project.slug === requested.slug"
              @click="select(project.slug)"
            >
              <img v-if="project.logoUrl" :src="project.logoUrl" alt="" width="36" height="36" />
              <span
                ><strong>{{ project.name }}</strong
                ><small>{{ project.summary }}</small></span
              >
              <em class="picker-since">Since {{ project.startedYear }}</em>
            </button>
          </div>
        </div>
        <div v-if="requested" class="picker-detail" aria-live="polite">
          <p>{{ requested.description }}</p>
          <div class="picker-actions">
            <a :href="requested.url" class="button button-dark"
              >Explore {{ requested.name }} <ArrowIcon
            /></a>
            <a :href="`#work-${requested.slug}`" class="text-link"
              >{{ chapterLink(requested) }} <ArrowIcon direction="down"
            /></a>
          </div>
        </div>
      </div>
    </section>

    <section id="work" class="work" aria-labelledby="work-title" :aria-busy="loading">
      <div class="work-head wrap">
        <h2 id="work-title" class="eyebrow">The projects, up close</h2>
      </div>
      <div class="wrap">
        <ResourceState :loading="loading" :error="error" label="projects" @retry="reload" />
      </div>
      <template v-if="projects?.length">
        <ProjectChapter
          v-for="(project, index) in projects"
          :key="project.slug"
          :project="project"
          :index="index"
        />
      </template>
      <p v-else-if="projects && !projects.length" class="resource-state wrap">
        New projects will appear here.
      </p>
    </section>

    <section class="bridge wrap" aria-labelledby="bridge-title">
      <p class="eyebrow">The person behind the studio</p>
      <h2 id="bridge-title">One builder, since 2014.</h2>
      <div class="bridge-copy">
        <p>
          Beyond Blockchain is Quentin de Beauchesne, also known as ffmad. Before these products, he
          founded the CryptoFR community in 2014, co-founded Ledgys, and co-founded Ownest, where he
          spent eight years building blockchain software for supply chains.
        </p>
        <RouterLink class="text-link" to="/quentin"
          >Meet Quentin <ArrowIcon direction="right"
        /></RouterLink>
      </div>
    </section>
  </div>
</template>
