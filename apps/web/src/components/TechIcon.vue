<script setup lang="ts">
import { computed } from 'vue';
import { techIcon, techInitials } from '../content/technologies';

// A technology's logo in its brand colour, or its initials when there's no logo.
const props = defineProps<{ name: string }>();
const icon = computed(() => techIcon(props.name));
</script>

<template>
  <svg v-if="icon" class="tech-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path :d="icon.path" :fill="`#${icon.hex}`" />
  </svg>
  <span v-else class="tech-icon tech-initials" aria-hidden="true">{{ techInitials(name) }}</span>
</template>
