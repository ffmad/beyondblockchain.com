import { inject, shallowRef, type InjectionKey, type ShallowRef } from 'vue';
import type { InitialResources, Project } from '@beyond/shared';
import { contentPath, type Locale } from '@beyond/shared/metadata.js';

// The header's project chips read the same list as the studio page without consuming its hydration snapshot.
export const projectDirectoryKey: InjectionKey<ShallowRef<Project[] | null>> =
  Symbol('project-directory');

export function createProjectDirectory(
  initialResources: InitialResources | undefined,
  locale: Locale,
) {
  const snapshot = initialResources?.[contentPath('/api/projects', locale)];
  return shallowRef<Project[] | null>(
    snapshot && !snapshot.error ? ((snapshot.data as Project[] | null) ?? null) : null,
  );
}

export function useProjectDirectory() {
  return inject(projectDirectoryKey, shallowRef<Project[] | null>(null));
}
