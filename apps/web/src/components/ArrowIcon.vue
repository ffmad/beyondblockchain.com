<script setup lang="ts">
withDefaults(defineProps<{ direction?: 'right' | 'up' | 'down' }>(), { direction: 'up' });
</script>

<template>
  <svg
    class="arrow-icon"
    :class="`arrow-${direction}`"
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M5 19 19 5M5 5h14v14"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
