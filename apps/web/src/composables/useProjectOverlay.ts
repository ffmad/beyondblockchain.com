import { inject, ref, type InjectionKey, type Ref } from 'vue';

// A project opened from the studio page shows over it, at the project's own address (/work/<slug>), so the
// address can be shared and Back closes it. Opened any other way (a shared link, a refresh), the same address
// is a page of its own.
export const projectOverlayKey: InjectionKey<Ref<boolean>> = Symbol('project-overlay');

/** History state marking a project address as opened over the studio page. */
export const overStudio = { backdrop: '/' };

export const isOverStudio = () =>
  typeof window !== 'undefined' && window.history.state?.backdrop === overStudio.backdrop;

export function useProjectOverlay() {
  return inject(projectOverlayKey, ref(false));
}

// While a product's card grows into its window (or the window shrinks back), the card's parts and the window's
// matching parts share view-transition names, on whichever side is showing. Set only in the browser.
export type MorphPart = 'window' | 'shot' | 'name' | 'logo';
export const morphing = ref<string | null>(null);

export function morphStyle(slug: string | undefined, part: MorphPart, showing = true) {
  return showing && slug && morphing.value === slug
    ? { viewTransitionName: `project-${part}` }
    : undefined;
}

/** Whether a product's card is at least partly on screen, so the window can grow out of it. */
export function cardOnScreen(slug: string) {
  const card = document.getElementById(`card-${slug}`)?.closest('.project-card');
  if (!card) return false;
  const { top, bottom } = card.getBoundingClientRect();
  return bottom > 0 && top < window.innerHeight;
}
