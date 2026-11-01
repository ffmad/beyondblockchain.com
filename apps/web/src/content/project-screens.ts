import type { Project } from '@beyond/shared';
import { ikitaiScreens } from './app-screens';

export interface ProjectScreen {
  src: string;
  alt: string;
  /** A phone screen rather than a desktop capture. */
  phone: boolean;
  width: number;
  height: number;
  /** Smaller copies for phones, when the screen has them. */
  srcset?: string;
}

// Screens 1000 px wide or more also come 360 and 720 px wide (docs/ASSETS.md), next to the full one.
function withCopies(screen: Omit<ProjectScreen, 'srcset'>): ProjectScreen {
  if (screen.width < 1000 || !screen.src.endsWith('.webp')) return screen;
  const base = screen.src.slice(0, -'.webp'.length);
  return {
    ...screen,
    srcset: `${base}-360.webp 360w, ${base}-720.webp 720w, ${screen.src} ${screen.width}w`,
  };
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
  return screens.map(withCopies);
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

// A few seconds of each project still in progress and each other project, recorded the same way
// (tools/record-clips.mjs), with its first frame as the cover on its card. Each is described in the interface text,
// under previews.<slug>.
const previews = new Set([
  'gengofriends',
  'spam-the-mempool',
  'shigoshima',
  'nakamotos-club',
  'onigiri',
  'cryptofr',
]);
export const PREVIEW_SIZE = { width: 960, height: 540 };

/** The preview of a project in progress or another project, if it has one. */
export function projectPreview(
  project: Project,
  t: Translate,
): { src: string; poster: string; alt: string } | null {
  return previews.has(project.slug)
    ? {
        src: `/projects/${project.slug}-clip.mp4`,
        poster: `/projects/${project.slug}-cover.webp`,
        alt: t(`previews.${project.slug}`, {}),
      }
    : null;
}

/** The project's site name, for its link label. */
export const projectHost = (project: Project) =>
  new URL(project.url).hostname.replace(/^www\./, '');
