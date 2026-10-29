import type { Prisma } from '../generated/prisma/client.js';

// The seed is the source of truth for these slugs. Other records are left alone.
export const projects = [
  {
    slug: 'ikitai',
    name: 'Ikitai',
    summary: 'Turn screenshots into plans.',
    description:
      'An app that turns screenshots and saved links into events and ideas. Keep track of ticket releases, set reminders, and make plans with friends.',
    audience: 'AI · Mobile app',
    url: 'https://getikitai.com',
    category: 'AI · Everyday life',
    role: 'Solo founder',
    startedYear: 2026,
    status: null,
    featured: true,
    displayOrder: 0,
    published: true,
    logoUrl: '/projects/ikitai-logo.svg',
    imageUrl: '/projects/ikitai-timeline.jpg',
    mobileImageUrl: null,
    imageAlt:
      'Ikitai’s app timeline showing a concert plan, ticket-sale reminder, and upcoming trip.',
    imageCaption: 'Real Ikitai app screens · Fictional demo plans',
    internalNotes:
      'User-confirmed current project, October 2026. No App Store or launch claim until confirmed.',
  },
  {
    slug: 'fairmints',
    name: 'Fairmints',
    summary: 'Create and trade on Bitcoin.',
    description:
      'Mint tokens and NFTs, explore Bitcoin-native assets, and trade through markets and swaps.',
    audience: 'For Bitcoin creators and collectors',
    url: 'https://fairmints.io',
    category: 'Bitcoin · Digital assets',
    role: null,
    startedYear: 2024,
    status: null,
    featured: false,
    displayOrder: 1,
    published: true,
    logoUrl: '/projects/fairmints-logo.svg',
    imageUrl: '/projects/fairmints-capture.png',
    mobileImageUrl: '/projects/fairmints-mobile.png',
    imageAlt:
      'The public Fairmints dashboard with Bitcoin token markets, swaps, and explorer tools.',
    imageCaption: 'Fairmints dashboard · Captured October 2026',
    internalNotes:
      'User-confirmed main current project since 2024, added 28 October 2026. Product scope verified at https://fairmints.io/docs/fairmints. Exact founder title not supplied.',
  },
  {
    slug: 'festcompass',
    name: 'FestCompass',
    summary: 'Find your next festival in Japan.',
    description:
      'Discover festivals by date and place, explore the lineups, and organize your festival schedule.',
    audience: 'For festivalgoers in Japan',
    url: 'https://festcompass.jp',
    category: 'Discovery · Music & culture',
    role: 'Solo founder',
    startedYear: 2026,
    status: null,
    featured: false,
    displayOrder: 2,
    published: true,
    logoUrl: '/projects/festcompass-logo.svg',
    imageUrl: '/projects/festcompass-guide.png',
    mobileImageUrl: '/projects/festcompass-mobile.png',
    imageAlt:
      'FestCompass’s public festival discovery guide, with dates and festivals across Japan.',
    imageCaption: 'FestCompass festival guide · Captured October 2026',
    internalNotes:
      'User-confirmed current project, July 2026. No ticketing, integration, or traction claims.',
  },
] satisfies Prisma.ProjectCreateInput[];
