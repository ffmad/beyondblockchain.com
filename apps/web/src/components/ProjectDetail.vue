<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Project } from '@beyond/shared';
import ArrowIcon from './ArrowIcon.vue';
import ScreenViewer from './ScreenViewer.vue';
import DetailClip from './DetailClip.vue';
import TechIcon from './TechIcon.vue';
import { projectClip, projectHost, projectScreens } from '../content/project-screens';
import { useLocale } from '../i18n';
import { morphStyle } from '../composables/useProjectOverlay';

// One project in full: what it is, its real screens, what it's built with, and a link to it. The same content
// shows in the studio page's project window and on the project's own page. In the window, `morph` names the parts
// that the product's card grows into.
const props = defineProps<{
  project: Project;
  heading: 'h1' | 'h2';
  headingId: string;
  morph?: boolean;
}>();
const { t } = useLocale();
const screens = computed(() => projectScreens(props.project, t));
// The product in use takes its main capture's place, which stays its poster and its full-size screen.
const clip = computed(() => projectClip(props.project));
// The screen open at full size, if any.
const viewing = ref<number | null>(null);
const platformNames: Record<string, string> = { web: 'Web', ios: 'iOS', android: 'Android' };
const facts = computed(() =>
  [
    props.project.stage && t(`studio.stage.${props.project.stage}`),
    props.project.market && t(`studio.market.${props.project.market}`),
    t('project.since', { year: props.project.startedYear }),
    props.project.role,
    props.project.audience,
    props.project.platforms.map((platform) => platformNames[platform] ?? platform).join(' · '),
    props.project.languages.length > 4
      ? t('studio.languagesCount', { n: props.project.languages.length })
      : props.project.languages.map((language) => language.toUpperCase()).join(' · '),
  ].filter((fact): fact is string => !!fact),
);
</script>

<template>
  <article class="project-detail" :aria-labelledby="headingId">
    <header class="detail-head">
      <img
        v-if="project.logoUrl"
        class="detail-logo"
        :style="morph ? morphStyle(project.slug, 'logo') : undefined"
        :src="project.logoUrl"
        alt=""
        width="56"
        height="56"
      />
      <div>
        <p class="detail-category">{{ project.category }}</p>
        <component
          :is="heading"
          :id="headingId"
          class="detail-name"
          :style="morph ? morphStyle(project.slug, 'name') : undefined"
          tabindex="-1"
          :data-page-focus="heading === 'h1' ? '' : undefined"
          >{{ project.name }}</component
        >
      </div>
    </header>
    <p class="detail-summary">{{ project.summary }}</p>

    <div
      v-if="screens.length"
      class="detail-gallery"
      :style="morph ? morphStyle(project.slug, 'shot') : undefined"
    >
      <template v-for="(screen, index) in screens" :key="screen.src">
        <DetailClip
          v-if="index === 0 && clip"
          :src="clip.src"
          :poster="clip.poster"
          :name="project.name"
          :enlarge-label="t('project.enlarge', { n: 1, total: screens.length })"
          @enlarge="viewing = 0"
        />
        <button
          v-else
          type="button"
          class="shot-button"
          :aria-label="t('project.enlarge', { n: index + 1, total: screens.length })"
          @click="viewing = index"
        >
          <img
            :class="screen.phone ? 'shot-phone' : 'shot-wide'"
            :src="screen.src"
            :srcset="screen.srcset"
            :sizes="
              screen.phone
                ? '(max-width: 706px) 111px, (max-width: 1118px) 16vw, 175px'
                : '(max-width: 567px) 302px, (max-width: 1133px) 54vw, 604px'
            "
            :alt="screen.alt"
            :width="screen.width"
            :height="screen.height"
            decoding="async"
          />
        </button>
      </template>
    </div>
    <ScreenViewer
      :screens="screens"
      :index="viewing"
      :name="project.name"
      @change="viewing = $event"
      @close="viewing = null"
    />
    <p v-if="project.imageCaption" class="detail-caption">{{ project.imageCaption }}</p>

    <div class="detail-body">
      <p class="detail-description">{{ project.description }}</p>
      <div class="detail-aside">
        <p class="detail-facts">
          <span v-for="fact in facts" :key="fact">{{ fact }}</span>
        </p>
        <div v-if="project.stack.length" class="detail-stack">
          <p class="eyebrow">{{ t('project.builtWith') }}</p>
          <ul>
            <li v-for="tech in project.stack" :key="tech"><TechIcon :name="tech" />{{ tech }}</li>
          </ul>
        </div>
        <a class="button button-dark detail-visit" :href="project.url"
          >{{ t('project.visit', { host: projectHost(project) }) }} <ArrowIcon
        /></a>
      </div>
    </div>
  </article>
</template>
