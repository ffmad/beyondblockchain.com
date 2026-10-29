import { inject, onMounted, onUnmounted, ref, shallowRef, type InjectionKey } from 'vue';
import type { InitialResources } from '@beyond/shared';

export const initialResourcesKey: InjectionKey<InitialResources> = Symbol('initial-resources');

export function useResource<T>(path: string) {
  const snapshots = inject(initialResourcesKey, {});
  const initial = snapshots[path];
  // Only the initial hydration consumes the snapshot. Later visits fetch fresh content.
  delete snapshots[path];
  const data = shallowRef<T | null>((initial?.data as T | null) ?? null);
  const loading = ref(!initial);
  const error = ref(initial?.error ?? false);
  let controller: AbortController | undefined;
  let active = true;

  async function load() {
    controller?.abort();
    const request = new AbortController();
    controller = request;
    loading.value = true;
    error.value = false;
    data.value = null;
    const timeout = setTimeout(() => request.abort(), 10000);
    try {
      const response = await fetch(path, {
        signal: request.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Content unavailable');
      const result = (await response.json()) as T;
      if (active && controller === request) data.value = result;
    } catch {
      if (active && controller === request) error.value = true;
    } finally {
      clearTimeout(timeout);
      if (active && controller === request) loading.value = false;
    }
  }
  onMounted(() => {
    if (!initial) void load();
  });
  onUnmounted(() => {
    active = false;
    controller?.abort();
  });
  return { data, loading, error, reload: load };
}
