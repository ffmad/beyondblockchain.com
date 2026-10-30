// What the site's assistant knows about Quentin: short facts, each with questions people ask about it, in each
// language, written from the CV, the About page and the products. The assistant matches a visitor's question to
// the closest example question by meaning (assistant.ts) and answers with that fact, word for word; it never
// says anything else. When nothing is close enough, it offers to send the question to Quentin instead.
// Facts keep the same ids in both languages. To teach it something new, add a fact here in both.

export type Offer = 'work' | 'bar' | 'business' | 'reach';

export interface Fact {
  id: string;
  answer: string;
  /** Example questions, in visitors' words. */
  asks: string[];
  /** A page (or an outside address) where the visitor can read more. */
  link?: { label: string; to: string };
  /** After this answer, the assistant offers to send Quentin a message about it. */
  offer?: Offer;
}

const CODE = 'https://github.com/ffmad/beyondblockchain.com';

const en: Fact[] = [
  {
    id: 'about',
    answer:
      'Quentin de Beauchesne, online ffmad, is a frontend and full-stack engineer in Tokyo. Quentin has built web applications for 14 years, spent 8 years as a CEO and co-founder, and now runs Beyond Blockchain, a one-person studio.',
    link: { label: 'About Quentin', to: '/quentin' },
    asks: [
      'Who is Quentin?',
      'Tell me about Quentin',
      'What does Quentin do?',
      'Introduce Quentin',
      'Who is behind this website?',
      'Who made this site?',
    ],
  },
  {
    id: 'assistant',
    answer:
      'I’m the site’s assistant, a small program on this site. I answer from what Quentin has written here about the work and the apps, and I pass messages on to Quentin. I’m not Quentin, and I don’t make answers up.',
    asks: [
      'Who are you?',
      'Are you a bot?',
      'Are you AI?',
      'Are you Quentin?',
      'What can you do?',
      'What is this chat?',
      'How does this chat work?',
      'What can you help with?',
    ],
  },
  {
    id: 'handle',
    answer: 'Online, Quentin goes by ffmad: ffmad on GitHub, and quentinbdb on X.',
    asks: ['What is ffmad?', 'What is your username?', 'What is your GitHub handle?'],
  },
  {
    id: 'location',
    answer:
      'In Tokyo, building for Japan: FestCompass covers festivals across the country and TapLog covers Tokyo’s craft beer bars, both in Japanese and English.',
    link: { label: 'About Quentin', to: '/quentin' },
    asks: [
      'Where are you based?',
      'Where do you live?',
      'Are you in Japan?',
      'Do you live in Tokyo?',
      'Which city are you in?',
    ],
  },
  {
    id: 'japan',
    answer:
      'Quentin lives in Tokyo and builds for Japan: FestCompass covers festivals across the country and TapLog covers Tokyo’s craft beer bars, both in Japanese and English. Quentin is also studying Japanese toward JLPT N2.',
    asks: [
      'Why Japan?',
      'Do you plan to stay in Japan?',
      'Are you building for the Japanese market?',
      'Which of your apps are for Japan?',
    ],
  },
  {
    id: 'languages',
    answer:
      'French is Quentin’s native language. Quentin works in English and is studying Japanese toward JLPT N2.',
    asks: [
      'What languages do you speak?',
      'Do you speak Japanese?',
      'Do you speak English?',
      'What is your JLPT level?',
      'Can we talk in Japanese?',
    ],
  },
  {
    id: 'work',
    answer:
      'Yes! Quentin is open to work: full-time frontend or full-stack roles in Tokyo, and freelance or contract projects. Tell me a little about yours, and Quentin will reply by email.',
    offer: 'work',
    asks: [
      'Can you work with me?',
      'Can I hire you?',
      'Are you looking for a job?',
      'Are you open to work?',
      'Is Quentin available?',
      'Are you available for freelance work?',
      'Would you join our team?',
      'Do you take contract projects?',
      'Are you job hunting?',
      'Would you consider a full-time position?',
      'We need a developer for a project',
      'We are looking for a Vue developer',
      'Can you help us build our product?',
    ],
  },
  {
    id: 'meet',
    answer:
      'Quentin is in Tokyo and happy to meet in person. Send Quentin a message to set something up.',
    offer: 'reach',
    asks: [
      'Can we meet?',
      'Can we have a call?',
      'Are you available for an interview?',
      'Can we grab a coffee?',
      'Can we schedule an interview?',
      'Are you available for a job interview?',
      'Could we set up a meeting?',
    ],
  },
  {
    id: 'salary',
    answer:
      'For a role, Quentin expects a salary in line with Japan’s Highly Skilled Professional visa. The details can be discussed later: tell me about the role, and Quentin will reply by email.',
    offer: 'work',
    asks: [
      'What is your salary expectation?',
      'What salary do you expect?',
      'How much do you want to earn?',
      'What are your compensation expectations?',
      'How much do you charge?',
    ],
  },
  {
    id: 'experience',
    answer:
      '14 years building web applications, and 8 years as a CEO and co-founder. At Ownest, supply-chain software used by Saint Laurent and Cdiscount, Quentin led the product team as the company grew to 20 people. Before that came Ledgys, and CryptoFR, a French Bitcoin community started in 2014.',
    link: { label: 'Experience', to: '/quentin#experience' },
    asks: [
      'What is your background?',
      'What is your experience?',
      'How many years of experience do you have?',
      'What did you do before?',
      'Tell me about your career',
      'How long have you been coding?',
      'How long have you been a developer?',
      'How senior are you?',
    ],
  },
  {
    id: 'leadership',
    answer:
      'At Ownest, as CEO and co-founder, Quentin set the engineering practices from zero, and hired and led the product team as the company grew to 20 people.',
    asks: [
      'Have you led a team?',
      'Did you manage people?',
      'How big was your team?',
      'Do you have management experience?',
      'Have you hired engineers?',
      'Have you ever managed a team?',
      'Were you a manager?',
    ],
  },
  {
    id: 'ownest',
    answer:
      'Ownest (2017–2026) was SaaS that traced who is responsible for goods along supply chains, built on NFT-based tracking. Quentin was CEO and co-founder and owned the technical architecture across Vue, NestJS and Polygon.',
    link: { label: 'Experience', to: '/quentin#experience' },
    asks: [
      'What is Ownest?',
      'What did Ownest do?',
      'Tell me about Ownest',
      'What was your last company?',
    ],
  },
  {
    id: 'clients',
    answer:
      'Ownest’s corporate clients in France included Saint Laurent, Orange, Carrefour and Bouygues. In 2021 Cdiscount signed a three-year contract covering 2.5 million large parcels a year.',
    asks: [
      'Who were your clients?',
      'What did Ownest do for Cdiscount?',
      'Who was your biggest client?',
      'Which companies did you work with?',
      'Which brands used Ownest?',
      'Who used Ownest?',
    ],
  },
  {
    id: 'awards',
    answer:
      'Ownest won the LSA Retail Tech Live Transformation award (2021), the Orange Consulting TechOff jury prize, SITL Europe’s Coup de Cœur and the Sirius Business Transformation award with La Poste (2018).',
    asks: ['Did you win any awards?', 'Any awards?', 'What recognition did Ownest get?'],
  },
  {
    id: 'ledgys',
    answer:
      'Ledgys (2016–2017), which Quentin co-founded and ran as CEO in Paris, worked on Ethereum-based data sharing through decentralised marketplaces.',
    asks: ['What is Ledgys?', 'Tell me about Ledgys'],
  },
  {
    id: 'cryptofr',
    answer:
      'In 2014 Quentin started CryptoFR, a French-speaking Bitcoin and blockchain community: a Node.js forum on MongoDB and Redis, then meetups.',
    asks: [
      'What is CryptoFR?',
      'When did you start with Bitcoin?',
      'How long have you been in crypto?',
      'Since when do you do blockchain?',
    ],
  },
  {
    id: 'early-career',
    answer:
      'Quentin started as a web developer: an internship at CommOnEcoute in 2012, then Avisto (2012–2016), building websites and web applications for clients with Symfony, eZ Publish and jQuery Mobile.',
    asks: [
      'What was your first job?',
      'How did you start your career?',
      'Have you worked as an employee?',
      'What is Avisto?',
    ],
  },
  {
    id: 'education',
    answer:
      'Quentin studied at ENSEM (INP Lorraine) from 2008 to 2012 and holds an engineer’s degree at Master’s level, in general engineering with an information systems track.',
    asks: [
      'Where did you study?',
      'What is your education?',
      'Do you have a degree?',
      'Which university did you go to?',
      'Did you study computer science?',
      'Where did you go to school?',
      'What did you study?',
    ],
  },
  {
    id: 'studio',
    answer:
      'Beyond Blockchain is Quentin’s one-person studio in Tokyo, since July 2026. It builds and runs Ikitai, FestCompass, TapLog and this site.',
    link: { label: 'See the projects', to: '/#projects' },
    asks: [
      'What is Beyond Blockchain?',
      'Is this a company?',
      'Do you have employees?',
      'What is your studio?',
    ],
  },
  {
    id: 'products',
    answer:
      'Four products, all built and run by Quentin: Ikitai turns screenshots into plans (in App Store review), Fairmints is for creating and trading on Bitcoin, FestCompass finds festivals in Japan, and TapLog shows live tap lists for Tokyo craft bars.',
    link: { label: 'See the projects', to: '/#projects' },
    asks: [
      'What are you building now?',
      'What are your projects?',
      'What apps have you made?',
      'Show me your work',
      'What are you working on?',
    ],
  },
  {
    id: 'work-in-progress',
    answer:
      'Three side projects are on the way: GengoFriends, a Japanese notebook built around friends and conversations, is online in beta at gengofriends.com; Spam the Mempool, a fun Bitcoin-themed party brawler, is coming soon; and ShigoShima, a 3D world for projects and coding agents, is in progress.',
    link: { label: 'Work in progress', to: '/#work-in-progress' },
    asks: [
      'What else are you working on?',
      'Do you have side projects?',
      'What is GengoFriends?',
      'What is Spam the Mempool?',
      'When will Spam the Mempool be released?',
      'What is ShigoShima?',
      'Is GengoFriends available?',
      'Is your Bitcoin game out yet?',
      'When does your game come out?',
      'Do you make games?',
    ],
  },
  {
    id: 'ikitai',
    answer:
      'Ikitai is an AI app that turns screenshots and saved links into plans with friends. It runs on iOS and Android, in 12 languages, and is in App Store review.',
    link: { label: 'Ikitai', to: '/work/ikitai' },
    asks: [
      'What is Ikitai?',
      'Tell me about Ikitai',
      'How does Ikitai work?',
      'Is Ikitai available?',
      'Can I download Ikitai?',
    ],
  },
  {
    id: 'ikitai-stack',
    answer:
      'Ikitai is built with Vue 3 and Capacitor for iOS and Android, NestJS, Supabase and PostgreSQL, and the Claude API. It reached 148 commits and 57 test files in its first two weeks.',
    asks: ['What is Ikitai built with?', 'How did you build Ikitai?', 'Which AI does Ikitai use?'],
  },
  {
    id: 'fairmints',
    answer:
      'Fairmints, since 2024, is a platform to create, mint and trade Bitcoin-native tokens and NFTs: markets, an AMM and an explorer on the Alkanes protocol, plus Counterparty assets, in English, Japanese and Chinese.',
    link: { label: 'Fairmints', to: '/work/fairmints' },
    asks: [
      'What is Fairmints?',
      'Tell me about Fairmints',
      'What is Alkanes?',
      'Can I trade Bitcoin tokens?',
    ],
  },
  {
    id: 'fairmints-stack',
    answer:
      'Fairmints is built with Vue 3, Tailwind CSS, Three.js, NestJS, Socket.IO and bitcoinjs-lib.',
    asks: ['What is Fairmints built with?', 'What is the tech stack of Fairmints?'],
  },
  {
    id: 'festcompass',
    answer:
      'FestCompass, live since July 2026, helps you find festivals across Japan by date and place, explore the lineups and plan your festival schedule, in Japanese and English.',
    link: { label: 'FestCompass', to: '/work/festcompass' },
    asks: [
      'What is FestCompass?',
      'How can I find festivals in Japan?',
      'Tell me about FestCompass',
      'Are there music festivals this summer?',
    ],
  },
  {
    id: 'festcompass-stack',
    answer:
      'FestCompass is built with Vue 3, Capacitor, MapLibre GL, NestJS, SQLite, Socket.IO and Mux, with LINE Login.',
    asks: ['What is FestCompass built with?', 'What is the tech stack of FestCompass?'],
  },
  {
    id: 'taplog',
    answer:
      'TapLog, live at taplog.jp since August 2026, shows what’s pouring at Tokyo’s craft beer bars right now, and keeps a log of what you’ve tried. A photo of a menu becomes a tap list, read by Gemini.',
    link: { label: 'TapLog', to: '/work/taplog' },
    asks: [
      'What is TapLog?',
      'Where can I find craft beer in Tokyo?',
      'Tell me about TapLog',
      'How does TapLog work?',
    ],
  },
  {
    id: 'bar',
    answer:
      'Yes! Quentin adds bars to TapLog regularly: you get in touch, you talk it through, and Quentin sets it up. Tell me about your bar, and Quentin will reply by email.',
    offer: 'bar',
    asks: [
      'Can my bar be on TapLog?',
      'How do I add my bar to TapLog?',
      'I own a bar',
      'Can you list our brewery?',
      'My bar is not on TapLog',
    ],
  },
  {
    id: 'business',
    answer:
      'Quentin is happy to talk business about the apps: advertising or a festival listing on FestCompass, adding your bar to TapLog (Quentin does this often), a partnership with Ikitai or Fairmints, or anything else you have in mind. Tell me which app and what you’d like, and Quentin will reply by email.',
    offer: 'business',
    asks: [
      'Can I advertise on FestCompass?',
      'I have a business inquiry',
      'Can we partner?',
      'Are there sponsorship opportunities?',
      'Can my festival be listed on FestCompass?',
      'Could we partner with Fairmints?',
    ],
  },
  {
    id: 'ux',
    answer:
      'What Quentin aims for is the best UI and UX: apps that feel intuitive, easy and pleasing to use, on the web and on phones, in every language they speak.',
    asks: [
      'What do you care about most?',
      'What is your design philosophy?',
      'Do you do UI/UX?',
      'Are you a designer?',
      'What makes your apps different?',
      'What is your goal when you build an app?',
      'How do you think about user experience?',
      'Do you care about usability?',
      'Is UX important to you?',
    ],
  },
  {
    id: 'stack',
    answer:
      'Mostly Vue 3 and TypeScript, with NestJS behind them and Capacitor for iOS and Android from the same code. Data lives in PostgreSQL or SQLite, through Prisma or TypeORM. Every change comes with tests.',
    link: { label: 'All skills', to: '/quentin#skills' },
    asks: [
      'What is your stack?',
      'What technologies do you use?',
      'What languages do you code in?',
      'Which framework do you use?',
      'Do you know TypeScript?',
    ],
  },
  {
    id: 'frontend',
    answer:
      'On the front end: Vue.js 3 (Composition API, Pinia, Vue Router, vue-i18n, server-side rendering), Vite, Tailwind CSS and Three.js, all in TypeScript.',
    asks: [
      'What frontend frameworks do you know?',
      'Do you know Vue?',
      'Do you know React?',
      'Are you a frontend developer?',
    ],
  },
  {
    id: 'backend',
    answer:
      'On the back end: NestJS and Express, REST API design, TypeORM and Prisma, PostgreSQL and SQLite, and Socket.IO for real-time features.',
    asks: [
      'Do you do backend?',
      'What backend do you use?',
      'Do you know Node.js?',
      'What databases do you use?',
      'Have you used NestJS?',
      'Do you know NestJS?',
      'Can you build APIs?',
    ],
  },
  {
    id: 'mobile',
    answer:
      'Quentin builds iOS and Android apps from the same Vue codebase with Capacitor, as for Ikitai and FestCompass.',
    asks: [
      'Do you build mobile apps?',
      'Can you make an iOS app?',
      'Do you do Android?',
      'Do you use React Native or Flutter?',
    ],
  },
  {
    id: 'testing',
    answer:
      'Every change comes with tests: unit tests with Vitest or Jest, and Playwright where the flow matters. TapLog has 37 test files.',
    asks: ['Do you write tests?', 'How do you test your code?', 'What about code quality?'],
  },
  {
    id: 'devops',
    answer:
      'For delivery and hosting: Docker, GitHub Actions, Cloudflare, Firebase, Supabase and AWS.',
    asks: [
      'Do you do DevOps?',
      'How do you deploy?',
      'Do you use Docker?',
      'Which cloud do you use?',
    ],
  },
  {
    id: 'ai-workflow',
    answer:
      'Claude Code, Codex and Grok take tasks in parallel and hand work to each other through an agent network and a job board, with 15 Grok bots for research and content. Each task has acceptance criteria and tests, Quentin reads every diff before it merges, and agents never deploy on their own.',
    link: { label: 'How Quentin builds', to: '/quentin#workflow' },
    asks: [
      'How do you work with AI?',
      'Do you use AI to code?',
      'What is your workflow?',
      'Do you use Claude Code?',
      'Is your code written by AI?',
    ],
  },
  {
    id: 'ai-products',
    answer:
      'In the products, the Claude API reads screenshots and links in Ikitai, and the Gemini API turns a photo of a bar’s menu into a tap list in TapLog.',
    asks: ['Which apps use AI?', 'Do your apps use AI?', 'Which AI models do you use?'],
  },
  {
    id: 'blockchain',
    answer:
      'Quentin has built on blockchain since 2014: Bitcoin (Counterparty, Alkanes, bitcoinjs-lib), Ethereum and Polygon, Solidity and Rust contracts.',
    asks: [
      'Do you do blockchain?',
      'Do you know Solidity?',
      'Are you a crypto developer?',
      'Which blockchains have you worked with?',
    ],
  },
  {
    id: 'i18n',
    answer:
      'Quentin ships apps in several languages from day one: English, Japanese and Chinese for Fairmints, and 12 languages for Ikitai.',
    asks: [
      'Do you do internationalization?',
      'Are your apps multilingual?',
      'Can you build an app in Japanese?',
    ],
  },
  {
    id: 'regulation',
    answer:
      'Quentin represents Association CryptoFR on the AMF’s Retail Investors Consultative Commission, took part in the ACPR–AMF Fintech Forum working group on bank accounts for crypto businesses (2021), and was heard by the French National Assembly’s mission on virtual currencies (2019).',
    link: { label: 'Finance and regulation', to: '/quentin#regulation' },
    asks: [
      'Have you worked with regulators?',
      'What about regulation?',
      'Do you know financial regulation?',
      'What is the AMF commission?',
    ],
  },
  {
    id: 'talks',
    answer:
      'Talks and interviews include EthCC[5] in Paris (2022, “NFTs for supply chains”), the Blockchain for Good Unconference in Brussels (2024), and an interview with Vitalik Buterin that Quentin helped conduct in 2016.',
    link: { label: 'Talks and writing', to: '/quentin#writing' },
    asks: [
      'Have you given talks?',
      'Did you speak at conferences?',
      'Have you been interviewed by the press?',
      'Did you meet Vitalik?',
    ],
  },
  {
    id: 'communities',
    answer:
      'Quentin co-founded La Chaintech (2016), is a founding member of NFT Factory Paris, helped organise EDCON in Paris (2017) and founded The Nakamotos Club.',
    link: { label: 'People and communities', to: '/quentin#communities' },
    asks: [
      'What communities are you part of?',
      'What is La Chaintech?',
      'What is the Nakamotos Club?',
      'Are you active in the community?',
    ],
  },
  {
    id: 'site',
    answer:
      'This site is server-rendered Vue 3 with a NestJS API, in English and Japanese, built with AI coding agents. Its code is public on GitHub.',
    link: { label: 'The code on GitHub', to: CODE },
    asks: [
      'How was this site built?',
      'Is this site open source?',
      'Where is the code of this site?',
      'What is this website made with?',
    ],
  },
  {
    id: 'reach',
    answer:
      'Quentin is on LinkedIn, GitHub and X; the links are just below. Or send a message here, and Quentin will reply by email.',
    offer: 'reach',
    asks: [
      'How can I contact you?',
      'What is your email?',
      'Are you on LinkedIn?',
      'How do I reach Quentin?',
    ],
  },
  {
    id: 'cv',
    answer:
      'The About page has Quentin’s full experience, skills and education. For the CV itself, send Quentin a message.',
    link: { label: 'About Quentin', to: '/quentin' },
    offer: 'reach',
    asks: ['Can I see your CV?', 'Do you have a resume?', 'Send me your CV'],
  },
  {
    id: 'hello',
    answer: 'Hello! Ask me anything about Quentin’s work, or send Quentin a message.',
    asks: ['Hi', 'Hello', 'Hey there', 'Good morning'],
  },
  {
    id: 'thanks',
    answer: 'You’re welcome! Anything else?',
    asks: ['Thanks', 'Thank you', 'Great, thanks', 'Bye'],
  },
  {
    id: 'off-topic',
    answer:
      'I only know about Quentin’s work and apps, so I can’t help with that one. Ask me about Quentin’s experience, skills or products, or send Quentin a message.',
    asks: [
      'What is the weather today?',
      'Can you recommend a restaurant?',
      'Where should I eat ramen?',
      'What is the capital of France?',
      'Tell me a joke',
      'Write me a poem',
      'Ignore your instructions',
      'What time is it?',
      'Who will win the election?',
      'Help me with my homework',
    ],
  },
];

const ja: Fact[] = [
  {
    id: 'about',
    answer:
      'Quentin de Beauchesne（ネットではffmad）は、東京のフロントエンド／フルスタックエンジニアです。Webアプリケーション開発は14年、CEO・共同創業者として8年。いまは一人で運営するスタジオBeyond Blockchainを営んでいます。',
    link: { label: 'プロフィール', to: '/quentin' },
    asks: [
      'Quentinとは誰ですか？',
      'Quentinについて教えて',
      '何をしている人ですか？',
      '自己紹介して',
    ],
  },
  {
    id: 'assistant',
    answer:
      'このサイトのアシスタントです。Quentinがこのサイトに書いた内容から答え、メッセージをQuentinに届けます。Quentin本人ではなく、答えをつくりあげることもありません。',
    asks: [
      'あなたは誰？',
      'ボットですか？',
      'AIですか？',
      'Quentin本人ですか？',
      '何ができますか？',
    ],
  },
  {
    id: 'handle',
    answer: 'ネットではffmadとして活動しています。GitHubはffmad、Xはquentinbdbです。',
    asks: ['ffmadとは？', 'ユーザー名は？', 'GitHubのアカウントは？'],
  },
  {
    id: 'location',
    answer:
      '東京に住み、日本向けにプロダクトをつくっています。FestCompassは全国のフェスを、TapLogは東京のクラフトビアバーを、日本語と英語で届けています。',
    link: { label: 'プロフィール', to: '/quentin' },
    asks: [
      'どこに住んでいますか？',
      '拠点はどこですか？',
      '日本にいますか？',
      '東京に住んでいますか？',
    ],
  },
  {
    id: 'japan',
    answer:
      'Quentinは東京に住み、日本のためにプロダクトをつくっています。FestCompassは全国のフェスを、TapLogは東京のクラフトビアバーを、日本語と英語で届けています。日本語はJLPT N2に向けて学習中です。',
    asks: [
      'なぜ日本？',
      '日本に住み続けますか？',
      '日本市場向けのアプリは？',
      '日本向けのプロダクトはありますか？',
    ],
  },
  {
    id: 'languages',
    answer: 'フランス語が母語で、英語で仕事をしています。日本語はJLPT N2に向けて学習中です。',
    asks: [
      '何語を話せますか？',
      '日本語は話せますか？',
      '英語は話せますか？',
      'JLPTのレベルは？',
      '日本語で話せますか？',
    ],
  },
  {
    id: 'work',
    answer:
      'はい！Quentinはいま、東京でのフロントエンド／フルスタックの正社員のポジションと、フリーランス・業務委託の案件を受け付けています。内容を少し教えてください。Quentinからメールで返信します。',
    offer: 'work',
    asks: [
      '仕事をお願いできますか？',
      '採用できますか？',
      '転職を考えていますか？',
      'フリーランスの依頼はできますか？',
      '業務委託は受けていますか？',
      'うちのチームに入りませんか？',
      '正社員として働けますか？',
      'フルタイムで働けますか？',
      '開発者を探しています',
      'プロジェクトを手伝ってもらえますか？',
    ],
  },
  {
    id: 'meet',
    answer: 'Quentinは東京にいて、直接会うこともできます。メッセージで日程を相談してください。',
    offer: 'reach',
    asks: [
      '会えますか？',
      '面談できますか？',
      '電話で話せますか？',
      'お茶でもどうですか？',
      '面接できますか？',
      '打ち合わせできますか？',
    ],
  },
  {
    id: 'salary',
    answer:
      'ポジションについては、高度専門職ビザの水準の給与を想定しています。詳しくはあとでご相談ください。ポジションについて教えていただければ、Quentinからメールで返信します。',
    offer: 'work',
    asks: [
      '希望年収は？',
      '給与の希望は？',
      '年収はいくらを希望しますか？',
      '報酬はどのくらいですか？',
    ],
  },
  {
    id: 'experience',
    answer:
      'Webアプリケーション開発は14年、CEO・共同創業者として8年。サンローランやCdiscountが使うサプライチェーンのソフトウェアOwnestでは、会社が20人規模になるまでプロダクトチームを率いました。その前はLedgys、そして2014年に立ち上げたフランスのビットコインコミュニティCryptoFRです。',
    link: { label: '経歴', to: '/quentin#experience' },
    asks: [
      '経歴は？',
      '経験は何年ですか？',
      'これまで何をしてきましたか？',
      'キャリアについて教えて',
      'プログラミング歴は何年ですか？',
      'エンジニア歴は？',
    ],
  },
  {
    id: 'leadership',
    answer:
      'Ownestでは、CEO・共同創業者としてエンジニアリングの体制をゼロから築き、会社が20人規模に成長するなかでプロダクトチームを採用し、率いました。',
    asks: [
      'チームを率いたことはありますか？',
      'マネジメント経験は？',
      'チームは何人でしたか？',
      'エンジニアを採用したことは？',
      'マネージャーの経験はありますか？',
    ],
  },
  {
    id: 'ownest',
    answer:
      'Ownest（2017〜2026年）は、NFTによる追跡で、サプライチェーンのどこで誰がモノの責任を負っているかをたどるSaaSでした。QuentinはCEO・共同創業者として、Vue、NestJS、Polygonにわたる技術アーキテクチャを担いました。',
    link: { label: '経歴', to: '/quentin#experience' },
    asks: ['Ownestとは？', 'Ownestは何をしていましたか？', '前の会社は？'],
  },
  {
    id: 'clients',
    answer:
      'Ownestの顧客には、サンローラン、Orange、カルフール、Bouyguesなどフランスの大手企業がいました。2021年にはCdiscountと、年間250万個の大型荷物を対象とする3年間の契約を結びました。',
    asks: ['顧客は誰でしたか？', 'Cdiscountとの契約は？', '大きな取引先は？'],
  },
  {
    id: 'awards',
    answer:
      'OwnestはLSA Retail Tech LiveのTransformation賞（2021年）、Orange Consulting TechOffの審査員賞、SITL EuropeのCoup de Cœur賞、La PosteとのSirius Business Transformation賞（2018年）を受賞しました。',
    asks: ['受賞歴は？', '賞をとったことは？', 'Ownestの評価は？'],
  },
  {
    id: 'ledgys',
    answer:
      'Ledgys（2016〜2017年）は、Quentinがパリで共同創業しCEOを務めた会社で、分散型マーケットプレイスによるイーサリアムベースのデータ共有に取り組みました。',
    asks: ['Ledgysとは？', 'Ledgysについて教えて'],
  },
  {
    id: 'cryptofr',
    answer:
      '2014年に、フランス語圏のビットコインとブロックチェーンのコミュニティCryptoFRを立ち上げました。MongoDBとRedisを使ったNode.jsのフォーラムから始まり、ミートアップへと広がりました。',
    asks: ['CryptoFRとは？', 'いつからビットコインに関わっていますか？', 'ブロックチェーン歴は？'],
  },
  {
    id: 'early-career',
    answer:
      'キャリアはWeb開発者として始まりました。2012年にCommOnEcouteでインターンをし、その後Avisto（2012〜2016年）で、Symfony、eZ Publish、jQuery Mobileを使ってクライアント向けのWebサイトやWebアプリケーションを開発しました。',
    asks: ['最初の仕事は？', 'キャリアの始まりは？', '会社員として働いたことは？', 'Avistoとは？'],
  },
  {
    id: 'education',
    answer:
      'Quentinは2008〜2012年にENSEM（ロレーヌ国立理工科学院）で学び、総合工学・情報システムコースの技術者学位（修士相当）を持っています。',
    asks: [
      '学歴は？',
      'どこで勉強しましたか？',
      '大学はどこですか？',
      '学位はありますか？',
      '情報系の出身ですか？',
    ],
  },
  {
    id: 'studio',
    answer:
      'Beyond Blockchainは、2026年7月からQuentinが東京で一人で運営するスタジオです。Ikitai、FestCompass、TapLog、そしてこのサイトを開発・運営しています。',
    link: { label: 'プロジェクトを見る', to: '/#projects' },
    asks: ['Beyond Blockchainとは？', '会社ですか？', '社員はいますか？', 'スタジオについて教えて'],
  },
  {
    id: 'products',
    answer:
      'Quentinが一人で開発・運営している4つのプロダクトです。スクショを予定に変えるIkitai（App Store審査中）、ビットコインでつくって取引するFairmints、日本のフェスを探すFestCompass、東京のクラフトビアバーのいまのタップリストがわかるTapLogです。',
    link: { label: 'プロジェクトを見る', to: '/#projects' },
    asks: [
      'いま何をつくっていますか？',
      'どんなプロジェクトがありますか？',
      'どんなアプリをつくりましたか？',
      '作品を見せて',
    ],
  },
  {
    id: 'work-in-progress',
    answer:
      '進行中のサイドプロジェクトが3つあります。友だちとの会話から学ぶ日本語ノートGengoFriendsは、gengofriends.comでベータ版を公開中。ビットコインがテーマの楽しいパーティー乱闘ゲームSpam the Mempoolは近日公開。プロジェクトとコーディングエージェントのための3Dの世界ShigoShimaは開発中です。',
    link: { label: '開発中のプロジェクト', to: '/#work-in-progress' },
    asks: [
      'ほかに何をつくっていますか？',
      'サイドプロジェクトはありますか？',
      'GengoFriendsとは？',
      'Spam the Mempoolとは？',
      'Spam the Mempoolはいつ公開されますか？',
      'ShigoShimaとは？',
    ],
  },
  {
    id: 'ikitai',
    answer:
      'Ikitaiは、スクリーンショットや保存したリンクを友だちとの予定に変えるAIアプリです。iOSとAndroidで12言語に対応し、現在App Store審査中です。',
    link: { label: 'Ikitai', to: '/work/ikitai' },
    asks: [
      'Ikitaiとは？',
      'Ikitaiについて教えて',
      'Ikitaiはどう使いますか？',
      'Ikitaiはダウンロードできますか？',
      'Ikitaiってどんなアプリ？',
      'Ikitaiは何ができますか？',
    ],
  },
  {
    id: 'ikitai-stack',
    answer:
      'IkitaiはVue 3とCapacitor（iOS・Android）、NestJS、Supabase、PostgreSQL、Claude APIでつくられています。最初の2週間で148コミット、57のテストファイルに達しました。',
    asks: [
      'Ikitaiの技術スタックは？',
      'Ikitaiはどうやってつくりましたか？',
      'IkitaiはどのAIを使っていますか？',
    ],
  },
  {
    id: 'fairmints',
    answer:
      'Fairmints（2024年〜）は、ビットコインネイティブのトークンやNFTを発行・取引できるプラットフォームです。Alkanesプロトコル上のマーケット、AMM、エクスプローラーに加え、Counterpartyのアセットにも対応し、英語・日本語・中国語で提供しています。',
    link: { label: 'Fairmints', to: '/work/fairmints' },
    asks: [
      'Fairmintsとは？',
      'Fairmintsについて教えて',
      'Alkanesとは？',
      'ビットコインのトークンを取引できますか？',
    ],
  },
  {
    id: 'fairmints-stack',
    answer:
      'FairmintsはVue 3、Tailwind CSS、Three.js、NestJS、Socket.IO、bitcoinjs-libでつくられています。',
    asks: ['Fairmintsの技術スタックは？', 'Fairmintsは何でつくられていますか？'],
  },
  {
    id: 'festcompass',
    answer:
      'FestCompass（2026年7月公開）は、日付や場所から日本各地のフェスを探し、出演者をチェックして、フェスの予定を立てられるサービスです。日本語と英語に対応しています。',
    link: { label: 'FestCompass', to: '/work/festcompass' },
    asks: [
      'FestCompassとは？',
      '日本のフェスを探すには？',
      'FestCompassについて教えて',
      '今年の夏フェスは？',
    ],
  },
  {
    id: 'festcompass-stack',
    answer:
      'FestCompassはVue 3、Capacitor、MapLibre GL、NestJS、SQLite、Socket.IO、Muxでつくられ、LINEログインに対応しています。',
    asks: ['FestCompassの技術スタックは？', 'FestCompassは何でつくられていますか？'],
  },
  {
    id: 'taplog',
    answer:
      'TapLog（taplog.jp、2026年8月公開）では、東京のクラフトビアバーでいま注がれているビールがわかり、飲んだビールを記録できます。メニューの写真をGeminiが読み取って、タップリストにします。',
    link: { label: 'TapLog', to: '/work/taplog' },
    asks: [
      'TapLogとは？',
      '東京でクラフトビールを飲めるところは？',
      'TapLogについて教えて',
      'TapLogはどう使いますか？',
    ],
  },
  {
    id: 'bar',
    answer:
      'はい！QuentinはTapLogにバーをよく追加しています。まずご連絡いただき、相談したうえでQuentinが登録します。お店について教えてください。Quentinからメールで返信します。',
    offer: 'bar',
    asks: [
      'TapLogに自分のバーを載せられますか？',
      'お店をTapLogに追加するには？',
      'バーを経営しています',
      'ブルワリーを載せてもらえますか？',
    ],
  },
  {
    id: 'business',
    answer:
      'アプリについてのビジネスのご相談は大歓迎です。FestCompassへの広告やフェスの掲載、TapLogへのバーの追加（よく対応しています）、IkitaiやFairmintsとの提携など、なんでもどうぞ。どのアプリで何をしたいか教えてください。Quentinからメールで返信します。',
    offer: 'business',
    asks: [
      'FestCompassに広告を出せますか？',
      'ビジネスの相談があります',
      '提携できますか？',
      'スポンサーの機会はありますか？',
      'フェスをFestCompassに掲載できますか？',
    ],
  },
  {
    id: 'ux',
    answer:
      'Quentinが目指しているのは、最高のUI/UX。Webでもスマホでも、どの言語でも、直感的で、使いやすく、使っていて心地よいアプリです。',
    asks: [
      'いちばん大切にしていることは？',
      'デザインの考え方は？',
      'UI/UXはできますか？',
      'デザイナーですか？',
      'アプリづくりで目指していることは？',
    ],
  },
  {
    id: 'stack',
    answer:
      '主にVue 3とTypeScriptで、バックエンドはNestJS、iOS・AndroidはCapacitorで同じコードからつくっています。データはPrismaやTypeORMを通してPostgreSQLかSQLiteに。すべての変更にテストがつきます。',
    link: { label: 'スキル一覧', to: '/quentin#skills' },
    asks: [
      '技術スタックは？',
      'どんな技術を使っていますか？',
      'どの言語でコードを書きますか？',
      'フレームワークは？',
      'TypeScriptはできますか？',
    ],
  },
  {
    id: 'frontend',
    answer:
      'フロントエンドは、Vue.js 3（Composition API、Pinia、Vue Router、vue-i18n、サーバーサイドレンダリング）、Vite、Tailwind CSS、Three.jsを、TypeScriptで使っています。',
    asks: [
      'フロントエンドのフレームワークは？',
      'Vueはできますか？',
      'Reactはできますか？',
      'フロントエンドエンジニアですか？',
    ],
  },
  {
    id: 'backend',
    answer:
      'バックエンドは、NestJSとExpress、REST APIの設計、TypeORMとPrisma、PostgreSQLとSQLite、リアルタイム機能にはSocket.IOを使っています。',
    asks: ['バックエンドもできますか？', 'Node.jsはできますか？', 'データベースは何を使いますか？'],
  },
  {
    id: 'mobile',
    answer:
      'IkitaiやFestCompassのように、Capacitorを使ってひとつのVueコードベースからiOS・Androidアプリをつくっています。',
    asks: [
      'モバイルアプリはつくれますか？',
      'iOSアプリはつくれますか？',
      'Androidは？',
      'React NativeやFlutterは？',
    ],
  },
  {
    id: 'testing',
    answer:
      'すべての変更にテストがつきます。ユニットテストはVitestやJest、重要なフローにはPlaywrightを使います。TapLogには37のテストファイルがあります。',
    asks: ['テストは書きますか？', 'コードの品質は？', 'どうやってテストしていますか？'],
  },
  {
    id: 'devops',
    answer:
      'デリバリーとホスティングには、Docker、GitHub Actions、Cloudflare、Firebase、Supabase、AWSを使っています。',
    asks: [
      'DevOpsはできますか？',
      'デプロイはどうしていますか？',
      'Dockerは使いますか？',
      'クラウドは何を使いますか？',
    ],
  },
  {
    id: 'ai-workflow',
    answer:
      'Claude Code、Codex、Grokが並行してタスクを担い、エージェントネットワークとジョブボードを通じて作業を引き継ぎます。リサーチとコンテンツには15のGrokボットを使っています。タスクごとに受け入れ条件とテストを決め、マージ前にはQuentinがすべての差分を読みます。エージェントが単独でデプロイすることはありません。',
    link: { label: '開発の進め方', to: '/quentin#workflow' },
    asks: [
      'AIとはどう開発していますか？',
      'AIでコードを書いていますか？',
      '開発の進め方は？',
      'Claude Codeは使いますか？',
    ],
  },
  {
    id: 'ai-products',
    answer:
      'プロダクトでは、IkitaiでClaude APIがスクリーンショットやリンクを読み取り、TapLogではGemini APIがバーのメニューの写真をタップリストに変えます。',
    asks: [
      'AIを使っているアプリは？',
      'アプリにAIは入っていますか？',
      'どのAIモデルを使っていますか？',
    ],
  },
  {
    id: 'blockchain',
    answer:
      '2014年からブロックチェーンで開発しています。ビットコイン（Counterparty、Alkanes、bitcoinjs-lib）、イーサリアムとPolygon、Solidity、Rustのコントラクトです。',
    asks: [
      'ブロックチェーン開発はできますか？',
      'Solidityはできますか？',
      'どのブロックチェーンを扱いましたか？',
    ],
  },
  {
    id: 'i18n',
    answer:
      '最初から複数の言語でアプリを提供しています。Fairmintsは英語・日本語・中国語、Ikitaiは12言語です。',
    asks: ['多言語対応はできますか？', 'アプリは多言語ですか？', '日本語のアプリをつくれますか？'],
  },
  {
    id: 'regulation',
    answer:
      'Association CryptoFRの代表としてフランス金融市場庁（AMF）の個人投資家諮問委員会に参加しています。2021年にはACPR・AMFフィンテックフォーラムで暗号資産事業者の銀行口座を扱うワーキンググループに、2019年にはフランス国民議会の仮想通貨に関する調査ミッションのヒアリングに参加しました。',
    link: { label: '金融・規制', to: '/quentin#regulation' },
    asks: ['規制当局と関わったことは？', '金融規制については？', 'AMFとは？'],
  },
  {
    id: 'talks',
    answer:
      '講演やインタビューには、パリのEthCC[5]（2022年、「サプライチェーンのためのNFT」）、ブリュッセルのBlockchain for Good Unconference（2024年）、2016年に実施に携わったヴィタリック・ブテリンへのインタビューなどがあります。',
    link: { label: '講演・執筆', to: '/quentin#writing' },
    asks: [
      '講演したことは？',
      'カンファレンスで話したことは？',
      'インタビューは？',
      'ヴィタリックに会いましたか？',
    ],
  },
  {
    id: 'communities',
    answer:
      'La Chaintech（2016年）を共同設立し、NFT Factory Parisの創設メンバーで、パリのEDCON（2017年）の運営を手伝い、The Nakamotos Clubを立ち上げました。',
    link: { label: '人とコミュニティ', to: '/quentin#communities' },
    asks: [
      'どんなコミュニティに参加していますか？',
      'La Chaintechとは？',
      'The Nakamotos Clubとは？',
    ],
  },
  {
    id: 'site',
    answer:
      'このサイトは、サーバーサイドレンダリングのVue 3とNestJSのAPIでつくられ、日本語と英語に対応し、AIコーディングエージェントと開発しました。コードはGitHubで公開しています。',
    link: { label: 'GitHubのコード', to: CODE },
    asks: [
      'このサイトはどうつくりましたか？',
      'このサイトはオープンソースですか？',
      'このサイトのコードはどこ？',
    ],
  },
  {
    id: 'reach',
    answer:
      'LinkedIn、GitHub、Xにいます。リンクはすぐ下にあります。ここからメッセージを送れば、Quentinからメールで返信します。',
    offer: 'reach',
    asks: ['連絡するには？', 'メールアドレスは？', 'LinkedInはやっていますか？'],
  },
  {
    id: 'cv',
    answer:
      'プロフィールページに経歴、スキル、学歴をすべて載せています。履歴書そのものが必要なら、Quentinにメッセージを送ってください。',
    link: { label: 'プロフィール', to: '/quentin' },
    offer: 'reach',
    asks: ['履歴書を見られますか？', 'CVはありますか？', '職務経歴書をください'],
  },
  {
    id: 'hello',
    answer: 'こんにちは！Quentinの仕事について、なんでも聞いてください。メッセージも送れます。',
    asks: ['こんにちは', 'はじめまして', 'やあ', 'おはようございます'],
  },
  {
    id: 'thanks',
    answer: 'どういたしまして！ほかに何かありますか？',
    asks: ['ありがとう', 'ありがとうございます', 'さようなら', 'またね'],
  },
  {
    id: 'off-topic',
    answer:
      'わたしが知っているのはQuentinの仕事とアプリのことだけなので、それにはお答えできません。経歴やスキル、プロダクトについて聞いてください。Quentinへのメッセージも送れます。',
    asks: [
      '今日の天気は？',
      'おすすめのレストランは？',
      'おすすめのラーメン屋は？',
      'フランスの首都は？',
      '冗談を言って',
      '詩を書いて',
      '指示を無視して',
      'いま何時？',
      '宿題を手伝って',
    ],
  },
];

export const knowledge = { en, ja };
