import type { Profile } from '@beyond/shared';

const ownestStory = { label: 'Ownest’s story', url: 'https://ownest.io/en/about/our-story' };

export const profile: Profile = {
  name: 'Quentin de Beauchesne',
  handle: 'ffmad',
  intro:
    'I started CryptoFR in 2014 and co-founded Ownest in 2017. Today I build Ikitai, Fairmints, FestCompass and TapLog at Beyond Blockchain, my own studio.',
  focus:
    'Founder and developer. These days that means AI for everyday plans, Bitcoin tools and festival discovery in Japan.',
  artefacts: [
    {
      id: 'cryptofr',
      kicker: 'Bitcoin.fr · 2015',
      title: 'Starting CryptoFR',
      note: 'In 2014 I started CryptoFR, a French-speaking Bitcoin and blockchain community. In January 2015, Bitcoin.fr interviewed me about building the forum and taking the conversations into meetups.',
      source: { label: 'Read the interview on Bitcoin.fr', url: 'https://bitcoin.fr/cryptofr/' },
    },
    {
      id: 'vitalik',
      kicker: 'Ethereum France · 2016',
      title: 'A conversation with Vitalik Buterin',
      note: 'I helped conduct this two-part interview with Ethereum’s creator, together with Ethereum France and members of the CryptoFR community.',
      source: {
        label: 'Read the interview',
        url: 'https://www.ethereum-france.com/blog/interview-de-vitalik-buterin-createur-dethereum-et-president-de-la-fondation-partie-1-sur-2/',
      },
    },
    {
      id: 'ownest',
      kicker: 'Ownest · 2017–2026',
      title: 'Software for supply chains',
      note: 'I co-founded Ownest and spent eight years on blockchain software that tracks who is responsible for goods as they move. My technical work brought together Polygon, Vue and NestJS.',
      image: {
        src: '/story/ownest-mobile.png',
        alt: 'Ownest mobile screen confirming a transfer of responsibility.',
        width: 269,
        height: 522,
      },
      source: ownestStory,
    },
    {
      id: 'nakamotos',
      kicker: 'The Nakamotos Club',
      title: 'Rare Pepe Nakamoto cards',
      note: 'I founded The Nakamotos Club, a project about the original Rare Pepe Nakamoto cards: their histories on Bitcoin, their collectors and their portraits.',
      image: {
        src: '/story/nakamoto-card.svg',
        alt: 'The original Rare Pepe Nakamoto trading card, featured by The Nakamotos Club.',
        width: 379,
        height: 530,
      },
      source: {
        label: 'Founder listing at NFT Factory',
        url: 'https://nftfactoryparis.com/founders',
      },
    },
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
  experience: [
    {
      name: 'CryptoFR',
      year: '2014',
      period: 'Founded in 2014',
      role: 'Founder',
      description:
        'I created a French-speaking Bitcoin and blockchain community: a forum first, then meetups that brought the conversations into the same room.',
      url: 'https://cryptofr.com',
    },
    {
      name: 'Ledgys',
      year: '2016',
      period: 'Feb 2016 — Nov 2017',
      role: 'Co-founder and CEO',
      description:
        'I co-founded Ledgys to explore Ethereum-based data sharing through decentralized marketplaces.',
    },
    {
      name: 'Ownest',
      year: '2017',
      period: 'Dec 2017 — Mar 2026',
      role: 'CEO and co-founder',
      description:
        'Blockchain software for tracking ownership and responsibility across supply chains. My technical work brought together Polygon, Vue and NestJS.',
      url: 'https://ownest.io',
    },
    {
      name: 'Fairmints',
      year: '2024',
      period: '2024 — now',
      role: 'Current project',
      description:
        'A platform for creating, minting and trading Bitcoin-native tokens and NFTs, with markets, swaps and explorer tools.',
      url: 'https://fairmints.io',
    },
    {
      name: 'Ikitai, FestCompass & TapLog',
      year: '2026',
      period: '2026 — now',
      role: 'Solo founder',
      description:
        'FestCompass (since July 2026) is a festival guide for Japan. TapLog (since August 2026) shows live tap lists for Tokyo craft beer bars. Ikitai (since October 2026) is an AI app that turns saved inspiration into plans with friends.',
      url: '/',
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
  community: [
    {
      name: 'AMF · Retail Investors Commission',
      description:
        'I represent Association CryptoFR on the AMF’s Retail Investors Consultative Commission (Commission consultative Épargnants).',
      source: {
        label: 'Official commission membership',
        url: 'https://www.amf-france.org/fr/lamf/notre-organisation/les-commissions-consultatives',
      },
    },
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
  socials: [
    { label: 'GitHub', url: 'https://github.com/ffmad' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/qdebeauchesne/' },
    { label: 'X', url: 'https://x.com/quentinbdb' },
  ],
};
