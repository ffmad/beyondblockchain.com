export interface Project {
  slug: string;
  name: string;
  summary: string;
  description: string;
  audience: string;
  url: string;
  category: string;
  role: string | null;
  startedYear: number;
  status: string | null;
  featured: boolean;
  logoUrl: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  imageAlt: string | null;
  imageCaption: string | null;
  /** The technologies it's built with, in display order. */
  stack: string[];
  /** Main products have cards and a page; experiments and earlier work are listed more briefly. */
  kind: 'product' | 'experiment' | 'earlier';
  /** Where a product stands: live, in app-store review, or in beta. */
  stage: 'live' | 'review' | 'beta' | null;
  /** Where it can be used: web, ios, android. */
  platforms: string[];
  /** Interface languages, as language codes. */
  languages: string[];
  endedYear: number | null;
}

export interface Link {
  label: string;
  url: string;
}
export interface ResourceSnapshot {
  data: unknown | null;
  error: boolean;
}
export type InitialResources = Record<string, ResourceSnapshot>;
export interface Experience {
  name: string;
  /** Short year label for the story index, e.g. "2017". */
  year: string;
  period: string;
  role: string;
  description: string;
  url?: string;
}
export interface Achievement {
  year: string;
  title: string;
  description: string;
  source: Link;
}
export interface PublicWork {
  year: string;
  kind: string;
  title: string;
  description: string;
  source: Link;
}
export interface Artefact {
  id: string;
  kicker: string;
  title: string;
  note: string;
  image?: { src: string; alt: string; width: number; height: number };
  source: Link;
}
export interface NowItem {
  name: string;
  since: string;
  description: string;
  url: string;
}
export interface Profile {
  name: string;
  handle: string;
  intro: string;
  focus: string;
  artefacts: Artefact[];
  now: NowItem[];
  experience: Experience[];
  achievements: Achievement[];
  community: { name: string; description: string; source: Link }[];
  additionalProjects: {
    name: string;
    role: string;
    description: string;
    url: string;
    logoUrl: string;
    imageUrl: string;
    imageAlt: string;
    source: Link;
  }[];
  publicWork: PublicWork[];
  contributions: Achievement[];
  socials: Link[];
}
