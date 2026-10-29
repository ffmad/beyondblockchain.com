export const siteOrigin: string;
export interface PageMetadata {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}
export const pageMetadata: Record<string, PageMetadata>;
export function metadataFor(path: string): PageMetadata;
export function metadataTags(path: string): string;
