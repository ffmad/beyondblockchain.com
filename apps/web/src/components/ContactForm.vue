<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useLocale } from '../i18n';

// The "Say hello" form. Messages go to the API, which keeps them and forwards them to Slack.
const { t, locale } = useLocale();
const route = useRoute();
const name = ref('');
const email = ref('');
const message = ref('');
// Left empty by people; bots fill it in.
const website = ref('');
const state = ref<'idle' | 'sending' | 'sent' | 'invalid' | 'limited' | 'failed'>('idle');
const status = ref<HTMLElement | null>(null);
let shownAt = 0;
onMounted(() => (shownAt = Date.now()));

async function send() {
  if (state.value === 'sending') return;
  state.value = 'sending';
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value,
        website: website.value,
        locale,
        page: route.fullPath,
        elapsed: Date.now() - shownAt,
      }),
    });
    state.value = response.ok
      ? 'sent'
      : response.status === 400
        ? 'invalid'
        : response.status === 429
          ? 'limited'
          : 'failed';
    if (response.ok) name.value = email.value = message.value = '';
  } catch {
    state.value = 'failed';
  }
  await nextTick();
  status.value?.focus({ preventScroll: true });
}
</script>

<template>
  <form class="contact-form" @submit.prevent="send">
    <template v-if="state !== 'sent'">
      <label class="contact-field">
        <span>{{ t('contact.name') }}</span>
        <input v-model="name" name="name" autocomplete="name" maxlength="100" required />
      </label>
      <label class="contact-field">
        <span>{{ t('contact.email') }}</span>
        <input
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          maxlength="200"
          required
        />
      </label>
      <label class="contact-field">
        <span>{{ t('contact.message') }}</span>
        <textarea v-model="message" name="message" rows="4" maxlength="3000" required></textarea>
      </label>
      <label class="contact-trap" aria-hidden="true">
        Website <input v-model="website" name="website" tabindex="-1" autocomplete="off" />
      </label>
      <div class="contact-actions">
        <button type="submit" class="button button-dark" :disabled="state === 'sending'">
          {{ state === 'sending' ? t('contact.sending') : t('contact.send') }}
        </button>
        <p class="contact-note">{{ t('contact.privacy') }}</p>
      </div>
    </template>
    <p
      ref="status"
      class="contact-status"
      :class="{ 'is-error': ['invalid', 'limited', 'failed'].includes(state) }"
      role="status"
      tabindex="-1"
    >
      <template v-if="state === 'sent'">{{ t('contact.sent') }}</template>
      <template v-else-if="state === 'invalid'">{{ t('contact.invalid') }}</template>
      <template v-else-if="state === 'limited'">{{ t('contact.limited') }}</template>
      <template v-else-if="state === 'failed'">{{ t('contact.failed') }}</template>
    </p>
  </form>
</template>
