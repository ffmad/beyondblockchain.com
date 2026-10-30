import type { Profile } from '@beyond/shared';

const ownestStory = { label: 'Ownest’s story', url: 'https://ownest.io/en/about/our-story' };

export const profile: Profile = {
  name: 'Quentin de Beauchesne',
  handle: 'ffmad',
  headline:
    'Frontend and full-stack engineer · Vue 3, TypeScript, NestJS · AI-assisted development',
  intro:
    'I’ve spent 14 years building web applications in JavaScript and TypeScript, and 8 years as a CEO and co-founder, setting engineering practice from zero. Today I build Vue 3 front ends for web, iOS and Android, with NestJS back ends, at Beyond Blockchain, my own studio in Tokyo.',
  focus:
    'I work every day with AI coding agents (Claude Code, Codex and Grok), and every change goes through tests and my review.',
  glance: [
    { label: 'Based in', value: 'Tokyo' },
    {
      label: 'Now',
      value: 'Founder of Beyond Blockchain (Ikitai, FestCompass, TapLog) and Fairmints',
    },
    {
      label: 'Before',
      value: 'CEO and co-founder of Ownest, which grew to 20 people (2017–2026)',
    },
    {
      label: 'Builds with',
      value: 'Vue 3, TypeScript and NestJS, with AI coding agents and tests on every change',
    },
    {
      label: 'Languages',
      value: 'French (native), English (business), Japanese (studying toward JLPT N2)',
    },
    { label: 'Education', value: 'ENSEM, engineer’s degree (Master’s level)' },
  ],
  now: [
    {
      name: 'Ikitai',
      since: 'Since October 2026',
      description: 'An AI app that turns screenshots and saved links into plans with friends.',
      url: '/work/ikitai',
    },
    {
      name: 'Fairmints',
      since: 'Since 2024',
      description: 'A platform for creating, minting and trading Bitcoin-native tokens and NFTs.',
      url: '/work/fairmints',
    },
    {
      name: 'FestCompass',
      since: 'Since July 2026',
      description:
        'Festival discovery and schedule planning for people attending festivals in Japan.',
      url: '/work/festcompass',
    },
    {
      name: 'TapLog',
      since: 'Since August 2026',
      description:
        'Live tap lists for Tokyo craft beer bars, with a personal log of what you’ve tried.',
      url: '/work/taplog',
    },
  ],
  workflow: [
    { title: 'Brief', text: 'Each task gets acceptance criteria and the tests it must pass.' },
    {
      title: 'Parallel agents',
      text: 'Claude Code, Codex and Grok take separate tasks and hand work to each other through an agent network.',
    },
    {
      title: 'Tests',
      text: 'Unit tests (Vitest, Jest) come with every change, and Playwright where the flow matters.',
    },
    {
      title: 'Review',
      text: 'I read every diff before it merges. Agents never deploy on their own.',
    },
    {
      title: 'Feedback',
      text: 'A recurring mistake becomes a rule in the agents’ instructions.',
    },
  ],
  workflowNote:
    'Ikitai reached 148 commits and 57 test files in its first two weeks (from its repository on 30 October 2026).',
  experience: [
    {
      name: 'Beyond Blockchain',
      year: '2026',
      period: 'Jul 2026 – now',
      role: 'Founder and product engineer',
      place: 'Tokyo',
      description:
        'My one-person studio. I build and run Ikitai, FestCompass, TapLog and this site: Vue 3 apps for web, iOS and Android with NestJS back ends. I set up the multi-agent workflow behind them, in which Claude Code, Codex and Grok take tasks in parallel and hand work to each other through an agent network and a job board, with 15 Grok bots for research and content.',
      url: '/',
    },
    {
      name: 'Fairmints',
      year: '2024',
      period: 'Oct 2024 – now',
      role: 'Founder',
      place: 'Tokyo',
      description:
        'A platform to create, mint and trade Bitcoin-native tokens and NFTs: markets, an AMM and an explorer on the Alkanes protocol, plus Counterparty (XCP) assets, in English, Japanese and Chinese. Built with Vue 3, Tailwind CSS, Three.js, NestJS, Socket.IO and bitcoinjs-lib.',
      url: 'https://fairmints.io',
    },
    {
      name: 'Ownest',
      year: '2017',
      period: 'Dec 2017 – Mar 2026',
      role: 'CEO and co-founder',
      place: 'Paris',
      description:
        'SaaS that traced who is responsible for goods along supply chains, built on NFT-based tracking. I owned the technical architecture across Vue, NestJS and Polygon, and hired and led the product team as the company grew to 20 people, with corporate clients in France including Saint Laurent, Orange, Carrefour and Bouygues.',
      url: 'https://ownest.io',
    },
    {
      name: 'Ledgys',
      year: '2016',
      period: 'Feb 2016 – Nov 2017',
      role: 'Co-founder and CEO',
      place: 'Paris',
      description: 'Ethereum-based data sharing through decentralised marketplaces.',
    },
    {
      name: 'CryptoFR',
      year: '2014',
      period: '2014 – now',
      role: 'Founder',
      description:
        'A French-speaking Bitcoin and blockchain community: a Node.js forum on MongoDB and Redis, then meetups that brought the conversations into the same room.',
      url: 'https://cryptofr.com',
    },
    {
      name: 'Avisto',
      year: '2012',
      period: 'Nov 2012 – Jan 2016',
      role: 'Web developer',
      place: 'Cachan',
      description:
        'Websites and web applications for clients, with Symfony, eZ Publish and jQuery Mobile.',
    },
    {
      name: 'CommOnEcoute',
      year: '2012',
      period: 'Mar – Aug 2012',
      role: 'Web development intern',
      place: 'Paris',
      description: 'The front end of a web application, in jQuery.',
    },
  ],
  achievements: [
    {
      year: '2021',
      title: 'From pilot to deployment',
      description:
        'Cdiscount signed a three-year contract with Ownest to deploy parcel tracking with a scope of 2.5 million large parcels per year.',
      source: ownestStory,
    },
    {
      year: '2021',
      title: 'LSA Retail Tech Live',
      description:
        'Ownest received the Transformation award for the 2020 edition, awarded in January 2021.',
      source: ownestStory,
    },
    {
      year: '2018',
      title: 'Recognition for Ownest',
      description:
        'Orange Consulting TechOff jury prize, SITL Europe jury’s Coup de Cœur, and the Sirius Business Transformation award with La Poste for Easy Shopping.',
      source: ownestStory,
    },
  ],
  skills: [
    { area: 'Languages', items: 'TypeScript, JavaScript, HTML/CSS' },
    {
      area: 'Front end',
      items:
        'Vue.js 3 (Composition API, Pinia, Vue Router, vue-i18n, server-side rendering), Vite, Tailwind CSS, Three.js',
    },
    {
      area: 'Back end and APIs',
      items: 'NestJS, Express, REST API design, TypeORM, Prisma, PostgreSQL, SQLite, Socket.IO',
    },
    { area: 'Mobile', items: 'Capacitor for iOS and Android apps from one Vue codebase' },
    { area: 'Testing', items: 'Jest, Vitest, Playwright' },
    {
      area: 'Delivery and hosting',
      items: 'Docker, GitHub Actions, Cloudflare, Firebase, Supabase, AWS',
    },
    {
      area: 'Internationalisation',
      items: 'Apps shipped in English, Japanese, Chinese and other languages',
    },
    {
      area: 'AI',
      items:
        'Claude Code, Codex and Grok for development; Claude API and Gemini API in product features',
    },
    {
      area: 'Blockchain',
      items:
        'Bitcoin (Counterparty, Alkanes, bitcoinjs-lib), Ethereum and Polygon, Solidity, Rust contracts',
    },
  ],
  community: [
    {
      name: 'La Chaintech',
      description:
        'Co-founded in June 2016 to bring together people working on blockchain in France.',
      source: {
        label: 'The story of the founding team',
        url: 'https://theblockchainforgood.org/index.php/2019/01/06/blockchain-et-chaine-logistique-suivre-les-objets-ou-rendre-responsables-les-gens-qui-les-suivent/',
      },
    },
    {
      name: 'NFT Factory Paris',
      description:
        'Founding member of the collective bringing together people across art, technology, and Web3.',
      source: { label: 'Meet the collective', url: 'https://nftfactoryparis.com/founders' },
    },
    {
      name: 'EDCON · Paris, 2017',
      description:
        'Helped the organizing team prepare the European Ethereum Development Conference in Paris in February 2017.',
      source: {
        label: 'Ethereum France’s event recap',
        url: 'https://www.ethereum-france.com/blog/retour-sur-ledcon-premiere-conference-europeenne-sur-ethereum-17-18-fevrier-2017/',
      },
    },
  ],
  additionalProjects: [
    {
      name: 'The Nakamotos Club',
      role: 'Founder',
      description:
        'A project around the original Rare Pepe Nakamoto cards: their individual histories on Bitcoin, the collectors, and the portraits that represent them.',
      url: 'https://thenakamotos.club',
      logoUrl: '/story/nakamotos-logo.png',
      imageUrl: '/story/nakamoto-card.svg',
      imageAlt: 'The original Rare Pepe Nakamoto trading card, featured by The Nakamotos Club.',
      source: {
        label: 'Founder listing at NFT Factory',
        url: 'https://nftfactoryparis.com/founders',
      },
    },
  ],
  publicWork: [
    {
      year: '2024',
      kind: 'Conversation',
      title: 'Food, water, energy & supply chains',
      description:
        'An open conversation at Blockchain for Good Unconference in Brussels, recorded during EthCC.',
      source: {
        label: 'Listen to the conversation',
        url: 'https://event.theblockchainforgood.org/index.php/2024/07/16/bfgu2-food-water-energy-supply-chain/',
      },
    },
    {
      year: '2022',
      kind: 'Interview · French',
      title: 'Ownest on B SMART',
      description:
        'Talking about Ownest on Instant Bitcoin with Nicolas Pagniez and Eva Ben-Saadi.',
      source: {
        label: 'Watch the interview',
        url: 'https://www.bsmart.fr/video/15266-instant-bitcoin-partie-26-aout-2022',
      },
    },
    {
      year: '2022',
      kind: 'Talk',
      title: 'NFTs for supply chains',
      description:
        'At EthCC[5], presenting Ownest’s approach to transferring responsibility alongside physical goods.',
      source: {
        label: 'Read the talk recap',
        url: 'https://fr.linkedin.com/posts/ownest_ethcc5-ethcc-ethereum-activity-6955458285676150784--OKV',
      },
    },
    {
      year: '2021',
      kind: 'Article',
      title: 'NFTs for Supplychain',
      description:
        'Why we used NFTs to track responsibility, and how the “hot potato” model works.',
      source: {
        label: 'Read on Medium',
        url: 'https://medium.com/ownest/nfts-for-supplychain-29eefa395265',
      },
    },
    {
      year: '2016',
      kind: 'Interview · French',
      title: 'A conversation with Vitalik Buterin',
      description:
        'An interview I helped conduct with Ethereum France and members of the CryptoFR community.',
      source: {
        label: 'Read the interview',
        url: 'https://www.ethereum-france.com/blog/interview-de-vitalik-buterin-createur-dethereum-et-president-de-la-fondation-partie-1-sur-2/',
      },
    },
    {
      year: '2015',
      kind: 'Interview · French',
      title: 'Starting CryptoFR',
      description:
        'On creating a French-speaking crypto community, building the forum, and taking the conversations into meetups.',
      source: {
        label: 'Read on Bitcoin.fr',
        url: 'https://bitcoin.fr/cryptofr/',
      },
    },
  ],
  contributions: [
    {
      year: 'Now',
      title: 'AMF · Retail Investors Consultative Commission',
      description:
        'Member of the AMF’s Retail Investors Consultative Commission (Commission consultative Épargnants), representing Association CryptoFR.',
      source: {
        label: 'Official commission membership',
        url: 'https://www.amf-france.org/fr/lamf/notre-organisation/les-commissions-consultatives',
      },
    },
    {
      year: '2021',
      title: 'ACPR–AMF Fintech Forum',
      description:
        'Represented Association CryptoFR in the working group on access to bank accounts for crypto-asset businesses.',
      source: {
        label: 'Working-group report',
        url: 'https://acpr.banque-france.fr/system/files/import/acpr/medias/documents/20210324_gtacces_cptes_crypto_crtravaux.pdf',
      },
    },
    {
      year: '2019',
      title: 'French National Assembly',
      description:
        'Represented Ownest in hearings for the fact-finding mission on virtual currencies, as listed in its January 2019 report.',
      source: {
        label: 'National Assembly report',
        url: 'https://www.assemblee-nationale.fr/dyn/docs/RINFANR5L15B1624.raw',
      },
    },
  ],
  education: [
    {
      years: '2008–2012',
      school: 'ENSEM (INP Lorraine)',
      detail:
        'Engineer’s degree, Master’s level, in general engineering, information systems track',
    },
  ],
  languages: 'French (native) · English (business) · Japanese (studying toward JLPT N2)',
  socials: [
    { label: 'GitHub', url: 'https://github.com/ffmad' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/qdebeauchesne/' },
    { label: 'X', url: 'https://x.com/quentinbdb' },
  ],
};
