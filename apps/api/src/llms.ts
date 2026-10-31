import type { Profile, Project } from '@beyond/shared';
import { siteOrigin } from '@beyond/shared/metadata.js';

// /llms.txt (llmstxt.org): a plain summary of the site for AI assistants and search tools, written from the same
// published projects and profile as the pages, so it never drifts from them.

const line = (text: string) => text.replace(/\s+/g, ' ').trim();
const years = (project: Project) =>
  project.endedYear
    ? `${project.startedYear}–${project.endedYear}`
    : `since ${project.startedYear}`;
const platformNames: Record<string, string> = { web: 'web', ios: 'iOS', android: 'Android' };
const stages: Record<string, string> = {
  live: 'live',
  review: 'in App Store review',
  beta: 'in beta',
  soon: 'coming soon',
};

function product(project: Project) {
  const facts = [
    project.stage && stages[project.stage],
    project.market === 'japan' && 'built for Japan',
    project.platforms.length &&
      `on ${project.platforms.map((p) => platformNames[p] ?? p).join(', ')}`,
    project.languages.length && `in ${project.languages.length} languages`,
    project.role,
    years(project),
  ].filter(Boolean);
  return [
    `- [${project.name}](${siteOrigin}/work/${project.slug}): ${line(project.summary)} ${line(project.description)}`,
    `  ${facts.join('; ')}. Built with ${project.stack.join(', ')}. Website: ${project.url}`,
  ].join('\n');
}

export function llmsText(projects: Project[], profile: Profile) {
  const ofKind = (kind: Project['kind']) => projects.filter((p) => p.kind === kind);
  const sections = [
    `# Beyond Blockchain`,
    `> The studio of ${profile.name} (${profile.handle}), a developer in Tokyo. Pioneer in blockchain development since 2014, now building beyond it with AI. The site shows only Quentin's own work.`,
    line(
      `Quentin builds Vue 3 front ends for web, iOS and Android with NestJS back ends, ships products in several languages, aims for apps that are intuitive, easy and pleasing to use, and works with AI coding agents (Claude Code, Codex and Grok), reviewing every change. Every page is also in Japanese, under ${siteOrigin}/ja/.`,
    ),
    `## Products`,
    ofKind('product').map(product).join('\n'),
    `## Work in progress`,
    'Side projects on the way.',
    ofKind('experiment')
      .map(
        (p) =>
          `- ${p.url ? `[${p.name}](${p.url})` : p.name} (${[p.stage && stages[p.stage], years(p)].filter(Boolean).join(', ')}): ${line(p.summary)} ${line(p.description)} Built with ${p.stack.join(', ')}.`,
      )
      .join('\n'),
    `## Earlier work`,
    ofKind('earlier')
      .map(
        (p) =>
          `- ${p.url ? `[${p.name}](${p.url})` : p.name} (${years(p)})${p.role ? `, ${p.role}` : ''}: ${line(p.description)}`,
      )
      .join('\n'),
    `## About`,
    [
      `- [${profile.name}](${siteOrigin}/quentin): his experience, skills, how he builds with AI agents, finance and regulation work, talks and communities.`,
      `- [Beyond Blockchain in Japanese](${siteOrigin}/ja/)`,
      `- Contact: the assistant at the top right of every page answers questions about Quentin and passes messages on to him.`,
    ].join('\n'),
    `## Optional`,
    profile.socials.map((social) => `- [${social.label}](${social.url})`).join('\n'),
  ];
  return `${sections.filter(Boolean).join('\n\n')}\n`;
}
