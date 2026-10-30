// How the studio page's windows come and go: a short rise into place, a quicker fade away, the dimmed page
// behind them following. With reduced motion they simply appear and disappear.

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function riseIn(element: HTMLDialogElement) {
  const timing = { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' };
  element.animate(
    [
      { opacity: 0, transform: 'translateY(16px) scale(.985)' },
      { opacity: 1, transform: 'none' },
    ],
    timing,
  );
  element.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, pseudoElement: '::backdrop' });
}

/** Fades the window out and returns the animation, to wait for before closing it. */
export function fadeOut(element: HTMLDialogElement) {
  const timing = { duration: 160, easing: 'ease-in', fill: 'forwards' as const };
  const fade = element.animate(
    [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'translateY(10px) scale(.99)' },
    ],
    timing,
  );
  element.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, pseudoElement: '::backdrop' });
  return fade;
}

/** The window's own animations, to cancel once it has closed or when it reopens mid-fade. */
export function animations(element: HTMLElement) {
  return document.getAnimations().filter((a) => (a.effect as KeyframeEffect)?.target === element);
}
