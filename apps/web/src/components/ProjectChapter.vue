<script setup lang="ts">
import type { Project } from '@beyond/shared';
import ArrowIcon from './ArrowIcon.vue';
import CaptureViewer from './CaptureViewer.vue';
import IkitaiFlow from './IkitaiFlow.vue';

// Each project gets its own scene; the composition follows the evidence each one has.
defineProps<{ project: Project; index: number }>();
</script>

<template>
  <article
    :id="`work-${project.slug}`"
    class="chapter"
    :class="[`chapter-${project.slug}`, { 'chapter-flip': index % 2 === 1 }]"
    :aria-labelledby="`chapter-${project.slug}`"
  >
    <div class="chapter-inner wrap">
      <header class="chapter-copy">
        <p class="chapter-meta">
          <img
            v-if="project.logoUrl"
            :src="project.logoUrl"
            alt=""
            width="40"
            height="40"
            loading="lazy"
          />
          <span>{{ project.category }}</span>
          <span class="chapter-since">Since {{ project.startedYear }}</span>
        </p>
        <h2 :id="`chapter-${project.slug}`">{{ project.name }}</h2>
        <p class="chapter-summary">{{ project.summary }}</p>
        <p class="chapter-description">{{ project.description }}</p>
        <p v-if="project.status" class="chapter-status">{{ project.status }}</p>
        <p class="chapter-facts">
          <span v-if="project.role">{{ project.role }}</span
          ><span>{{ project.audience }}</span>
        </p>
        <a :href="project.url" class="button button-dark chapter-cta"
          >Explore {{ project.name }} <ArrowIcon
        /></a>
      </header>

      <div class="chapter-visual">
        <IkitaiFlow v-if="project.slug === 'ikitai'" />
        <template v-else-if="project.imageUrl">
          <img
            v-if="project.slug === 'festcompass'"
            class="scene-art"
            src="/projects/festcompass-background.jpg"
            alt=""
            width="1024"
            height="768"
            loading="lazy"
          />
          <div class="chapter-device">
            <CaptureViewer
              class="chapter-capture"
              :src="project.imageUrl"
              :alt="project.imageAlt ?? `${project.name} interface`"
              :width="1280"
              :height="720"
              :title="`${project.name} · Product interface`"
              :caption="project.imageCaption"
              :mobile-src="project.mobileImageUrl"
            >
              <span class="browser-frame"
                ><span class="browser-bar" aria-hidden="true"><i></i><i></i><i></i></span
                ><img
                  :src="project.imageUrl"
                  :alt="project.imageAlt ?? `${project.name} interface`"
                  width="1280"
                  height="720"
                  loading="lazy"
                  decoding="async"
              /></span>
            </CaptureViewer>
            <img
              v-if="project.mobileImageUrl && project.slug !== 'festcompass'"
              class="chapter-phone"
              :src="project.mobileImageUrl"
              :alt="`${project.name} on a phone`"
              width="390"
              height="844"
              loading="lazy"
            />
          </div>
          <p class="chapter-caption">{{ project.imageCaption }}</p>
        </template>
      </div>
    </div>
  </article>
</template>
