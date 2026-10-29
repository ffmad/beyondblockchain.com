<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

// A framed capture that opens at full size in a native dialog (Escape and the backdrop close it).
const props = defineProps<{
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  caption?: string | null;
  phone?: boolean;
  /** A real mobile capture shown instead on narrow screens. */
  mobileSrc?: string | null;
}>();
const dialog = ref<HTMLDialogElement | null>(null);
let overflow = '';
let open = false;

function show() {
  if (!dialog.value) return;
  overflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  open = true;
  dialog.value.showModal();
}
function restore() {
  if (!open) return;
  document.body.style.overflow = overflow;
  open = false;
}
onBeforeUnmount(restore);
</script>

<template>
  <div class="capture-viewer">
    <button
      type="button"
      class="capture-button"
      :aria-label="`Open the full ${props.title} capture`"
      aria-haspopup="dialog"
      @click="show"
    >
      <slot />
      <span class="capture-open">Full size <span aria-hidden="true">↗</span></span>
    </button>
    <dialog
      ref="dialog"
      class="capture-dialog"
      :aria-label="props.title"
      @close="restore"
      @click="$event.target === $event.currentTarget && dialog?.close()"
    >
      <div class="dialog-top">
        <h2>{{ props.title }}</h2>
        <button
          class="dialog-close"
          type="button"
          aria-label="Close"
          autofocus
          @click="dialog?.close()"
        >
          ×
        </button>
      </div>
      <div
        class="dialog-image"
        :class="{ 'is-phone': props.phone, 'has-mobile': props.mobileSrc }"
        tabindex="0"
        aria-label="Capture. Scroll to see all of it."
      >
        <picture v-if="props.mobileSrc"
          ><source media="(max-width: 700px)" :srcset="props.mobileSrc" width="390" height="844" />
          <img
            :src="props.src"
            :alt="props.alt"
            :width="props.width"
            :height="props.height"
            loading="lazy"
        /></picture>
        <img
          v-else
          :src="props.src"
          :alt="props.alt"
          :width="props.width"
          :height="props.height"
          loading="lazy"
        />
      </div>
      <p v-if="props.caption" class="dialog-bottom">{{ props.caption }}</p>
    </dialog>
  </div>
</template>
