<script setup lang="ts">
import type { Profile } from '@beyond/shared';
import { contentPath } from '@beyond/shared/metadata.js';
import { computed } from 'vue';
import { useLocale } from '../i18n';
import { useResource } from '../composables/useResource';
import { usePageAnchor } from '../composables/usePageAnchor';
import ResourceState from '../components/ResourceState.vue';
import ArrowIcon from '../components/ArrowIcon.vue';

// About me, in the studio's design: who I am and what I do, then what I'm making now, how I build with AI
// agents, my experience (newest first and worded as on my CV), skills, and the rest of the record.
const { t, locale } = useLocale();
const {
  data: profile,
  loading,
  error,
  reload,
} = useResource<Profile>(contentPath('/api/profile', locale));
usePageAnchor(profile);

const CODE_URL = 'https://github.com/ffmad/beyondblockchain.com';
// A current product has its page at /work/<slug> and its logo at /projects/<slug>-logo.svg.
const productSlug = (url: string) => url.match(/^\/work\/([\w-]+)$/)?.[1] ?? null;
const step = (index: number) => String(index + 1).padStart(2, '0');
const siteHost = (url: string) => new URL(url).hostname.replace(/^www\./, '');
// The title's separators stay with the words before them, so a wrapped line never starts with "·".
const headline = computed(() => profile.value?.headline.replaceAll(' · ', '\u00a0· ') ?? '');
</script>

<template>
  <div class="about-page">
    <section class="about-hero wrap" aria-labelledby="profile-title">
      <div class="about-hero-text">
        <p class="about-kicker">{{ t('profile.kicker') }}</p>
        <i18n-t
          id="profile-title"
          keypath="profile.hello"
          tag="h1"
          class="about-title"
          scope="global"
        >
          <template #name
            ><span>{{ t('profile.helloName') }}</span></template
          >
        </i18n-t>
        <template v-if="profile">
          <p class="about-headline">{{ headline }}</p>
          <p class="about-intro">{{ profile.intro }}</p>
          <p class="about-intro">{{ profile.home }}</p>
          <p class="about-focus">{{ profile.focus }}</p>
        </template>
        <div class="about-elsewhere">
          <i18n-t keypath="profile.handle" tag="p" class="about-handle" scope="global">
            <template #handle><a href="https://github.com/ffmad">ffmad</a></template>
          </i18n-t>
          <ul v-if="profile" class="about-links" :aria-label="t('profile.links')">
            <li v-for="link in profile.socials" :key="link.url">
              <a :href="link.url">{{ link.label }} <ArrowIcon /></a>
            </li>
            <li>
              <a :href="CODE_URL">{{ t('profile.code') }} <ArrowIcon /></a>
            </li>
          </ul>
        </div>
      </div>
      <aside v-if="profile" class="about-glance" :aria-label="t('profile.glance')">
        <dl>
          <div v-for="item in profile.glance" :key="item.label" class="glance-row">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </aside>
    </section>

    <div class="wrap">
      <ResourceState
        :loading="loading"
        :error="error"
        :label="t('profile.loadLabel')"
        @retry="reload"
      />
    </div>

    <template v-if="profile">
      <section id="now" class="about-section wrap" aria-labelledby="now-title">
        <div class="section-head">
          <h2 id="now-title">{{ t('profile.nowTitle') }}</h2>
        </div>
        <ul class="now-grid">
          <li v-for="item in profile.now" :key="item.name">
            <RouterLink v-if="productSlug(item.url)" :to="item.url" class="now-card">
              <span class="now-head">
                <img
                  :src="`/projects/${productSlug(item.url)}-logo.svg`"
                  alt=""
                  width="36"
                  height="36"
                  loading="lazy"
                />
                <span class="now-name">{{ item.name }}</span>
                <ArrowIcon direction="right" />
              </span>
              <span class="now-since">{{ item.since }}</span>
              <span class="now-text">{{ item.description }}</span>
            </RouterLink>
            <a v-else :href="item.url" class="now-card">
              <span class="now-head">
                <span class="now-name">{{ item.name }}</span>
                <ArrowIcon />
              </span>
              <span class="now-since">{{ item.since }}</span>
              <span class="now-text">{{ item.description }}</span>
            </a>
          </li>
        </ul>
      </section>

      <section id="experience" class="about-section wrap" aria-labelledby="experience-title">
        <div class="section-head">
          <h2 id="experience-title">{{ t('profile.experienceTitle') }}</h2>
        </div>
        <ol class="earlier-list record-list">
          <li v-for="item in profile.experience" :key="item.name" class="earlier-item record-item">
            <span class="earlier-years">{{ item.period }}</span>
            <div class="earlier-body">
              <h3>
                <RouterLink v-if="item.url === '/'" to="/">{{ item.name }} <ArrowIcon /></RouterLink
                ><a v-else-if="item.url" :href="item.url">{{ item.name }} <ArrowIcon /></a
                ><span v-else>{{ item.name }}</span>
                <span class="earlier-role">{{
                  item.place
                    ? t('profile.rolePlace', { role: item.role, place: item.place })
                    : item.role
                }}</span>
              </h3>
              <p>{{ item.description }}</p>

              <div v-if="item.name === 'Ownest'" class="ownest-notes">
                <figure class="ownest-screens">
                  <div class="ownest-gallery">
                    <img
                      src="/story/ownest-desktop.png"
                      :alt="t('profile.ownestAlt')"
                      width="758"
                      height="706"
                      loading="lazy"
                    />
                    <img
                      class="is-phone"
                      src="/story/ownest-mobile.png"
                      :alt="t('profile.ownestMobileAlt')"
                      width="269"
                      height="522"
                      loading="lazy"
                    />
                  </div>
                  <figcaption>{{ t('profile.ownestCaption') }}</figcaption>
                </figure>
                <i18n-t keypath="profile.ownestJoined" tag="p" scope="global">
                  <template #plugAndPlay
                    ><a
                      href="https://ownest.io/en/news/ownest-lafayette-plug-and-play-startups-innovation-platform"
                      >{{ t('profile.plugAndPlay') }}</a
                    ></template
                  >
                  <template #useCases
                    ><a href="https://ownest.io/en/usecases">{{
                      t('profile.useCases')
                    }}</a></template
                  >
                </i18n-t>
                <p class="eyebrow">{{ t('profile.milestones') }}</p>
                <ul class="milestones">
                  <li v-for="milestone in profile.achievements" :key="milestone.title">
                    <span class="milestone-year">{{ milestone.year }}</span>
                    <span
                      ><strong>{{
                        t('profile.milestoneTitle', { title: milestone.title })
                      }}</strong>
                      {{ milestone.description }}
                      <a :href="milestone.source.url">{{ milestone.source.label }}</a></span
                    >
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <section id="workflow" class="about-section wrap" aria-labelledby="workflow-title">
        <div class="section-head">
          <h2 id="workflow-title">{{ t('profile.workflowTitle') }}</h2>
        </div>
        <ol class="workflow">
          <li v-for="(item, index) in profile.workflow" :key="item.title" class="workflow-step">
            <span class="workflow-number" aria-hidden="true">{{ step(index) }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </li>
        </ol>
        <p class="workflow-note">
          {{ profile.workflowNote }}
          <a :href="CODE_URL">{{ t('profile.code') }} <ArrowIcon /></a>
        </p>
      </section>

      <section id="skills" class="about-section wrap" aria-labelledby="skills-title">
        <div class="section-head">
          <h2 id="skills-title">{{ t('profile.skillsTitle') }}</h2>
        </div>
        <dl class="skills">
          <div v-for="skill in profile.skills" :key="skill.area" class="skill">
            <dt>{{ skill.area }}</dt>
            <dd>{{ skill.items }}</dd>
          </div>
        </dl>
      </section>

      <section id="regulation" class="about-section wrap" aria-labelledby="regulation-title">
        <div class="section-head">
          <h2 id="regulation-title">{{ t('profile.regulationTitle') }}</h2>
        </div>
        <ul class="earlier-list record-list">
          <li v-for="item in profile.contributions" :key="item.title" class="earlier-item">
            <span class="earlier-years">{{ item.year }}</span>
            <div class="earlier-body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <a class="record-source" :href="item.source.url"
                >{{ item.source.label }} <ArrowIcon
              /></a>
            </div>
          </li>
        </ul>
      </section>

      <section id="writing" class="about-section wrap" aria-labelledby="writing-title">
        <div class="section-head">
          <h2 id="writing-title">{{ t('profile.sharedTitle') }}</h2>
        </div>
        <ul class="earlier-list record-list">
          <li v-for="item in profile.publicWork" :key="item.title" class="earlier-item">
            <span class="earlier-years">{{ item.year }}</span>
            <div class="earlier-body">
              <h3>
                <a :href="item.source.url">{{ item.title }} <ArrowIcon /></a>
                <span class="earlier-role">{{ item.kind }}</span>
              </h3>
              <p>{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </section>

      <section id="communities" class="about-section wrap" aria-labelledby="communities-title">
        <div class="section-head">
          <h2 id="communities-title">{{ t('profile.communitiesTitle') }}</h2>
        </div>
        <ul class="community-grid">
          <li v-for="item in profile.community" :key="item.name" class="community-item">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <a class="record-source" :href="item.source.url"
              >{{ item.source.label }} <ArrowIcon
            /></a>
          </li>
          <li
            v-for="project in profile.additionalProjects"
            :key="project.name"
            class="community-item"
          >
            <h3>
              <img :src="project.logoUrl" alt="" width="28" height="28" loading="lazy" />
              {{ project.name }}
            </h3>
            <p>
              {{
                t('profile.roleAndDescription', {
                  role: project.role,
                  description: project.description,
                })
              }}
            </p>
            <a class="record-source" :href="project.url"
              >{{ t('project.visit', { host: siteHost(project.url) }) }} <ArrowIcon
            /></a>
          </li>
        </ul>
      </section>

      <section id="education" class="about-section wrap" aria-labelledby="education-title">
        <div class="section-head">
          <h2 id="education-title">{{ t('profile.educationTitle') }}</h2>
        </div>
        <ul class="earlier-list record-list">
          <li v-for="item in profile.education" :key="item.school" class="earlier-item">
            <span class="earlier-years">{{ item.years }}</span>
            <div class="earlier-body">
              <h3>{{ item.school }}</h3>
              <p>{{ item.detail }}</p>
            </div>
          </li>
          <li class="earlier-item">
            <span class="earlier-years">{{ t('profile.languagesLabel') }}</span>
            <div class="earlier-body">
              <p class="about-languages">{{ profile.languages }}</p>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
