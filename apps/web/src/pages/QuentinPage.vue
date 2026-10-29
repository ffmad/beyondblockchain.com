<script setup lang="ts">
import type { Profile } from '@beyond/shared';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useResource } from '../composables/useResource';
import { usePageAnchor } from '../composables/usePageAnchor';
import ResourceState from '../components/ResourceState.vue';
import ArrowIcon from '../components/ArrowIcon.vue';

const { data: profile, loading, error, reload } = useResource<Profile>('/api/profile');
usePageAnchor(profile);

// Field notes: a few real artefacts, each opening into its short story.
const openId = ref('cryptofr');
const openArtefact = computed(
  () => profile.value?.artefacts.find((a) => a.id === openId.value) ?? profile.value?.artefacts[0],
);

// The year index follows the reader through "How I got here".
const activeYear = ref('');
let frame = 0;
function syncYear() {
  frame = 0;
  const chapters = document.querySelectorAll<HTMLElement>('[data-year]');
  let current = chapters[0]?.dataset.year ?? '';
  for (const chapter of chapters)
    if (chapter.getBoundingClientRect().top <= window.innerHeight * 0.4)
      current = chapter.dataset.year ?? current;
  activeYear.value = current;
}
function onScroll() {
  if (!frame) frame = requestAnimationFrame(syncYear);
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  syncYear();
});
watch(profile, async () => {
  await nextTick();
  syncYear();
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  cancelAnimationFrame(frame);
});
</script>

<template>
  <div class="field-notes">
    <section class="notes-hero wrap" aria-labelledby="profile-title">
      <div class="notes-greeting">
        <p class="eyebrow">Quentin de Beauchesne · Founder &amp; developer</p>
        <h1 id="profile-title">Hi, I’m <span>Quentin.</span></h1>
        <p class="notes-handle">Online, I’m <a href="https://github.com/ffmad">ffmad</a>.</p>
        <template v-if="profile">
          <p class="notes-intro">{{ profile.intro }}</p>
          <p class="notes-focus">{{ profile.focus }}</p>
        </template>
      </div>

      <div v-if="profile && openArtefact" class="artefacts">
        <div class="artefact-fan" role="group" aria-label="Things from my story">
          <button
            v-for="(artefact, index) in profile.artefacts"
            :key="artefact.id"
            type="button"
            class="artefact"
            :class="[`artefact-${artefact.id}`, { 'has-image': artefact.image }]"
            :style="{ '--i': index }"
            :aria-pressed="openArtefact.id === artefact.id"
            aria-controls="artefact-note"
            @click="openId = artefact.id"
          >
            <img
              v-if="artefact.image"
              :src="artefact.image.src"
              alt=""
              :width="artefact.image.width"
              :height="artefact.image.height"
            />
            <span class="artefact-kicker">{{ artefact.kicker }}</span>
            <span class="artefact-title">{{ artefact.title }}</span>
          </button>
        </div>
        <div id="artefact-note" class="artefact-note" aria-live="polite">
          <p class="eyebrow">{{ openArtefact.kicker }}</p>
          <h2>{{ openArtefact.title }}</h2>
          <p>{{ openArtefact.note }}</p>
          <a :href="openArtefact.source.url" class="text-link"
            >{{ openArtefact.source.label }} <ArrowIcon
          /></a>
        </div>
      </div>
    </section>

    <div class="wrap">
      <ResourceState :loading="loading" :error="error" label="personal story" @retry="reload" />
    </div>

    <template v-if="profile">
      <section id="now" class="notes-now wrap" aria-labelledby="now-title">
        <h2 id="now-title">What I’m making now</h2>
        <div class="now-list">
          <article v-for="item in profile.now" :key="item.name" class="now-item">
            <h3>
              <RouterLink v-if="item.url.startsWith('/')" :to="item.url"
                >{{ item.name }} <ArrowIcon direction="right"
              /></RouterLink>
              <a v-else :href="item.url">{{ item.name }} <ArrowIcon /></a>
            </h3>
            <p class="now-since">{{ item.since }}</p>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section id="story" class="notes-story wrap" aria-labelledby="story-title">
        <div class="story-rail">
          <h2 id="story-title">How I got here</h2>
          <nav class="year-index" aria-label="Years">
            <a
              v-for="item in profile.experience"
              :key="item.year"
              :href="`#year-${item.year}`"
              :aria-current="activeYear === item.year ? 'location' : undefined"
              >{{ item.year }}</a
            >
          </nav>
        </div>
        <div class="story-chapters">
          <article
            v-for="item in profile.experience"
            :id="`year-${item.year}`"
            :key="item.name"
            class="story-chapter"
            :data-year="item.year"
          >
            <p class="chapter-year" aria-hidden="true">{{ item.year }}</p>
            <div class="chapter-text">
              <h3>
                <RouterLink v-if="item.url === '/'" to="/">{{ item.name }} <ArrowIcon /></RouterLink
                ><a v-else-if="item.url" :href="item.url">{{ item.name }} <ArrowIcon /></a
                ><span v-else>{{ item.name }}</span>
              </h3>
              <p class="story-role">{{ item.role }} · {{ item.period }}</p>
              <p>{{ item.description }}</p>

              <div v-if="item.name === 'Ownest'" class="ownest-notes">
                <figure class="ownest-screens">
                  <img
                    src="/story/ownest-desktop.png"
                    alt="Ownest inventory interface for selecting items to transfer."
                    width="758"
                    height="706"
                    loading="lazy"
                  />
                  <figcaption>Ownest’s public product previews</figcaption>
                </figure>
                <p>
                  Ownest joined
                  <a
                    href="https://ownest.io/en/news/ownest-lafayette-plug-and-play-startups-innovation-platform"
                    >Lafayette Plug and Play</a
                  >
                  in 2017 and The Warehouse by Cdiscount in 2018.
                  <a href="https://ownest.io/en/usecases">Customer use cases</a> include Cdiscount
                  parcel tracking and Saint Laurent’s transfers between warehouses, head office and
                  stores.
                </p>
                <p class="eyebrow">Company milestones</p>
                <ul class="milestones">
                  <li v-for="milestone in profile.achievements" :key="milestone.title">
                    <span class="milestone-year">{{ milestone.year }}</span>
                    <span
                      ><strong>{{ milestone.title }}.</strong> {{ milestone.description }}
                      <a :href="milestone.source.url">{{ milestone.source.label }}</a></span
                    >
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="communities" class="notes-section wrap" aria-labelledby="communities-title">
        <h2 id="communities-title">People and communities</h2>
        <div class="community-grid">
          <article v-for="item in profile.community" :key="item.name" class="community-item">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <a :href="item.source.url">{{ item.source.label }} <ArrowIcon /></a>
          </article>
          <article
            v-for="project in profile.additionalProjects"
            :key="project.name"
            class="community-item"
          >
            <h3>{{ project.name }}</h3>
            <p>{{ project.role }}. {{ project.description }}</p>
            <a :href="project.url">Visit the club <ArrowIcon /></a>
          </article>
        </div>
      </section>

      <section id="writing" class="notes-section wrap" aria-labelledby="writing-title">
        <h2 id="writing-title">Things I’ve shared</h2>
        <ul class="shared-list">
          <li v-for="item in profile.publicWork" :key="item.title">
            <a :href="item.source.url">
              <span class="shared-year">{{ item.year }}</span>
              <span class="shared-body"
                ><span class="shared-kind">{{ item.kind }}</span
                ><strong>{{ item.title }}</strong
                ><span>{{ item.description }}</span></span
              >
              <ArrowIcon />
            </a>
          </li>
        </ul>
      </section>

      <section id="contributions" class="notes-section wrap" aria-labelledby="contributions-title">
        <h2 id="contributions-title">Public contributions</h2>
        <ul class="shared-list">
          <li v-for="item in profile.contributions" :key="item.title">
            <a :href="item.source.url">
              <span class="shared-year">{{ item.year }}</span>
              <span class="shared-body"
                ><strong>{{ item.title }}</strong
                ><span>{{ item.description }}</span></span
              >
              <ArrowIcon />
            </a>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
