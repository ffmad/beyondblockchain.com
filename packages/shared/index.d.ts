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
  /** Main products have cards and a page; projects in progress (experiments) and other projects get smaller
   * cards whose window plays a preview; earlier work is listed more briefly. */
  kind: 'product' | 'experiment' | 'other' | 'earlier';
  /** Where it stands: live, in app-store review, in beta, or coming soon. */
  stage: 'live' | 'review' | 'beta' | 'soon' | null;
  /** The country a product is built for, when it's built for one. */
  market: 'japan' | null;
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
  /** The year it started, e.g. "2017". */
  year: string;
  period: string;
  role: string;
  place?: string;
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
export interface NowItem {
  name: string;
  since: string;
  description: string;
  url: string;
}
export interface Skill {
  area: string;
  items: string;
}
export interface WorkflowStep {
  title: string;
  text: string;
}
export interface Education {
  years: string;
  school: string;
  detail: string;
}
export interface Profile {
  name: string;
  handle: string;
  /** What I do, in one line: the same title as the CV. */
  headline: string;
  intro: string;
  /** Living in Japan and building for it. */
  home: string;
  focus: string;
  /** The essentials at a glance, beside the introduction. */
  glance: { label: string; value: string }[];
  now: NowItem[];
  /** How I build with AI agents, step by step, and the evidence for it. */
  workflow: WorkflowStep[];
  workflowNote: string;
  /** Newest first, as on the CV. */
  experience: Experience[];
  /** Ownest's milestones. */
  achievements: Achievement[];
  skills: Skill[];
  /** Finance and regulation. */
  contributions: Achievement[];
  publicWork: PublicWork[];
  community: { name: string; description: string; source: Link }[];
  additionalProjects: {
    name: string;
    role: string;
    description: string;
    url: string;
    logoUrl: string;
    imageUrl?: string;
    imageAlt?: string;
    source: Link;
  }[];
  education: Education[];
  languages: string;
  socials: Link[];
}
