import { createI18n, useI18n } from 'vue-i18n';
import type { Locale } from '@beyond/shared/metadata.js';
import en from './en';
import ja from './ja';

export type { Locale };
/** Stored once the visitor picks a language, so the site stops suggesting one. */
export const languageChoiceKey = 'bb.language-choice';
/** Remembers that the visitor chose a language themselves. */
export function rememberLanguageChoice() {
  try {
    localStorage.setItem(languageChoiceKey, 'chosen');
  } catch {
    // Without storage the suggestion may simply come back.
  }
}
/** Where the visitor was when they switched language; index.html reads it as the other language's page opens. */
export const languageSwitchKey = 'bb.language-switch';
/**
 * Called as a language link is followed: remembers the choice, and the element nearest the top of the screen, so
 * the page in the other language opens at the same place and its words cross-fade from these ones.
 */
export function switchLanguage(event: MouseEvent) {
  rememberLanguageChoice();
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  let place: { id?: string; top?: number; y?: number } = {};
  if (window.scrollY > 0) {
    const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
    const anchor = [...document.querySelectorAll('main [id]')]
      .map((element) => ({ id: element.id, top: element.getBoundingClientRect().top }))
      .filter(({ top }) => top >= header - 1)
      .sort((a, b) => a.top - b.top)[0];
    place = anchor ?? { y: window.scrollY };
  }
  try {
    sessionStorage.setItem(languageSwitchKey, JSON.stringify(place));
  } catch {
    // Without storage the other page opens at the top, without the cross-fade.
  }
  document.documentElement.classList.add('language-switching');
  window.__rememberLanguageText?.();
}

declare global {
  interface Window {
    /** Keeps the text on screen, which the other language's page rewrites into its own (index.html). */
    __rememberLanguageText?: () => void;
    /** After a language switch, settles once the text is rewritten; the app starts then (main.ts). */
    __languageSettled?: Promise<void>;
    /** Ends the rewrite at once, so the app never starts on text that is still changing. */
    __languageFinish?: () => void;
  }
}
/** Each language's name for itself, for the switch between them. */
export const languageNames: Record<Locale, string> = { en: 'English', ja: '日本語' };

export function createSiteI18n(locale: Locale) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: { en, ja },
    missingWarn: import.meta.env.DEV,
    fallbackWarn: import.meta.env.DEV,
  });
}

/** The page's language, which stays the same for the whole visit, and its text. */
export function useLocale() {
  const { t, locale } = useI18n();
  return { t, locale: locale.value as Locale };
}
