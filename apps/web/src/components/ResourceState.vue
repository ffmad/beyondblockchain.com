<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import RefreshIcon from './RefreshIcon.vue';
import { useLocale } from '../i18n';

const props = defineProps<{ loading: boolean; error: boolean; label: string }>();
const emit = defineEmits<{ retry: [] }>();
const { t } = useLocale();
const feedback = ref<HTMLElement | null>(null);
const retryButton = ref<HTMLButtonElement | null>(null);
const attempted = ref(false);
const completed = ref(false);

function retry() {
  attempted.value = true;
  completed.value = false;
  emit('retry');
}
watch(
  () => props.loading,
  async (loading) => {
    if (loading || !attempted.value) return;
    completed.value = !props.error;
    await nextTick();
    // Keep keyboard users at the result instead of losing focus to the document.
    (props.error ? retryButton.value : feedback.value)?.focus({ preventScroll: true });
  },
);
</script>

<template>
  <div
    ref="feedback"
    class="resource-feedback"
    :class="{ 'resource-state': loading || error, 'state-error': error }"
    :role="error ? 'alert' : loading || completed ? 'status' : undefined"
    tabindex="-1"
  >
    <template v-if="loading"
      ><span class="loading-dot" aria-hidden="true"></span>
      {{ t('state.loading', { label }) }}</template
    >
    <template v-else-if="error">
      <p class="state-title">{{ t('state.failed', { label }) }}</p>
      <p>{{ t('state.retryLater') }}</p>
      <button ref="retryButton" class="button button-dark" type="button" @click="retry">
        {{ t('state.retry') }} <RefreshIcon />
      </button>
    </template>
    <span v-else-if="completed" class="sr-only">{{ t('state.loaded', { label }) }}</span>
  </div>
</template>
