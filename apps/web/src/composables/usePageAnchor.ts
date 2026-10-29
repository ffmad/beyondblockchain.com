import { nextTick, onMounted, watch, type Ref } from 'vue';

/** Resolve a direct section link after its API-backed content becomes available. */
export function usePageAnchor(data: Ref<unknown>) {
  const scroll = async () => {
    if (!data.value) return;
    await nextTick();
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (id) document.getElementById(id)?.scrollIntoView();
  };
  onMounted(scroll);
  watch(data, scroll);
}
