import type { Project } from '@beyond/shared';
import { ikitaiScreens } from './app-screens';

export interface ProjectScreen {
  src: string;
  alt: string;
  /** A phone screen rather than a desktop capture. */
  phone: boolean;
  width: number;
  height: number;
}

const PHONE_CAPTURE = { width: 390, height: 844 };
const APP_SCREEN = { width: 1320, height: 2868 };
const DESKTOP_CAPTURE = { width: 1280, height: 720 };

/** Looks up interface text, for screen descriptions. */
type Translate = (key: string, values: Record<string, unknown>) => string;

// Further real screens for projects that have more than their main and mobile captures.
const moreScreens: Record<string, (t: Translate) => ProjectScreen[]> = {
  ikitai: (t) =>
    ikitaiScreens.map(({ id, src }) => ({
      src,
      alt: t(`screens.ikitai.${id}`, {}),
      phone: true,
      ...APP_SCREEN,
    })),
};

/** The real screens to show for a project, its main capture first. */
export function projectScreens(project: Project, t: Translate): ProjectScreen[] {
  const screens: ProjectScreen[] = [];
  if (project.imageUrl) {
    // Without a separate mobile capture, the main image is the app's own phone screen.
    const phone = !project.mobileImageUrl;
    screens.push({
      src: project.imageUrl,
      alt: project.imageAlt ?? t('screens.interface', { name: project.name }),
      phone,
      ...(phone ? APP_SCREEN : DESKTOP_CAPTURE),
    });
  }
  if (project.mobileImageUrl)
    screens.push({
      src: project.mobileImageUrl,
      alt: t('screens.phone', { name: project.name }),
      phone: true,
      ...PHONE_CAPTURE,
    });
  for (const screen of moreScreens[project.slug]?.(t) ?? [])
    if (!screens.some((s) => s.src === screen.src)) screens.push(screen);
  return screens;
}

// A few seconds of each web product in use, silent and looping, recorded from the live site at the size of its
// capture (tools/record-clips.mjs). It plays over the capture, which stays as its poster.
const clips: Record<string, string> = {
  taplog: '/projects/taplog-clip.mp4',
  fairmints: '/projects/fairmints-clip.mp4',
  festcompass: '/projects/festcompass-clip.mp4',
};

/** The project's clip, if it has one; it starts from its main capture. */
export function projectClip(project: Project): { src: string; poster: string } | null {
  const src = clips[project.slug];
  return src && project.imageUrl && project.mobileImageUrl
    ? { src, poster: project.imageUrl }
    : null;
}

/** The project's address without the protocol, for its link label. */
export const projectHost = (project: Project) =>
  project.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
