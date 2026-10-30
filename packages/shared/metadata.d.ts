export type Locale = 'en' | 'ja';
export const siteOrigin: string;
export const locales: readonly Locale[];
export const defaultLocale: Locale;
export function localeFromPath(path: string): Locale;
export function stripLocale(path: string): string;
export function localizedPath(path: string, locale: Locale): string;
export function contentPath(path: string, locale: Locale): string;
export interface PageMetadata {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}
export interface ResolvedMetadata extends PageMetadata {
  /** Whether search engines may index the page. */
  indexed: boolean;
}
interface ProjectSummary {
  slug: string;
  name: string;
  summary: string;
  description: string;
  url?: string;
  kind?: string;
  platforms?: string[];
  languages?: string[];
}
export const pageMetadata: Record<Locale, Record<string, PageMetadata>>;
export function workSlug(path: string): string | null;
export function metadataFor(
  path: string,
  projects?: readonly ProjectSummary[] | null,
  locale?: Locale,
): ResolvedMetadata;
export function pageUrls(
  path: string,
  locale?: Locale,
): { canonical: string; alternates: Record<Locale, string> };
export function structuredData(
  path: string,
  projects?: readonly ProjectSummary[] | null,
  locale?: Locale,
): string;
export function metadataTags(
  path: string,
  projects?: readonly ProjectSummary[] | null,
  locale?: Locale,
  imageExists?: (image: string) => boolean,
): string;
