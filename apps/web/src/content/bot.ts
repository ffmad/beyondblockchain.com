import type { Locale } from '@beyond/shared/metadata.js';

// What the site's assistant knows: short answers about Quentin's work, written from the CV and the site, in each
// language. It answers only from these; a question it can't match becomes an offer to send Quentin a message.
// Keywords are matched in lower case, as whole words for Latin ones; on a tie the earlier topic wins.

export type TopicId =
  | 'work'
  | 'bar'
  | 'business'
  | 'now'
  | 'stack'
  | 'background'
  | 'location'
  | 'ai'
  | 'reach'
  | 'hello';

export interface Topic {
  id: TopicId;
  /** The visitor's question, as a reply button. */
  ask: string;
  answer: string;
  link?: { label: string; to: string };
  /** After this answer, offer to write to Quentin first. */
  offerMessage?: boolean;
  /** What to ask for the message when it follows this answer. */
  prompt?: string;
  keywords: string[];
}

export interface BotContent {
  greeting: string;
  /** The questions offered as buttons, in order. */
  suggested: TopicId[];
  topics: Topic[];
  unknown: string;
  sendIt: string;
  somethingElse: string;
  writeMessage: string;
  askName: string;
  askEmail: (name: string) => string;
  badEmail: string;
  askMessage: string;
  askDraft: string;
  sent: string;
  cancelled: string;
  tryAgain: string;
}

// Words shared by both languages: product and tool names.
const shared = {
  now: ['ikitai', 'fairmints', 'festcompass', 'taplog'],
  stack: ['vue', 'typescript', 'nestjs', 'nest', 'capacitor', 'prisma', 'postgresql', 'sqlite'],
  ai: ['ai', 'claude', 'codex', 'grok', 'llm', 'agent', 'agents'],
  reach: ['linkedin', 'github', 'twitter', 'email', 'mail'],
};

const en: BotContent = {
  greeting: 'Hi! I’m the site’s assistant. Ask me about Quentin’s work, or send Quentin a message.',
  suggested: ['work', 'business', 'now', 'stack', 'background', 'location'],
  topics: [
    {
      id: 'work',
      ask: 'Can you work with me?',
      answer:
        'Yes! Quentin is open to work: full-time frontend or full-stack roles in Tokyo, and freelance or contract projects. Tell me a little about yours, and Quentin will reply by email.',
      prompt: 'Tell me about the role or project. A few lines are enough.',
      offerMessage: true,
      keywords: [
        'work',
        'hire',
        'hiring',
        'job',
        'role',
        'position',
        'freelance',
        'contract',
        'available',
        'availability',
        'recruit',
        'recruiting',
        'recruiter',
        'employ',
        'opportunity',
        'collaborate',
        'collaboration',
        'project for',
        'open to',
      ],
    },
    // Before "business" and "now", so "add my bar to TapLog" gets the answer about bars.
    {
      id: 'bar',
      ask: 'Can my bar be on TapLog?',
      answer:
        'Yes! Quentin adds bars to TapLog regularly: you get in touch, you talk it through, and Quentin sets it up. Tell me about your bar, and Quentin will reply by email.',
      prompt: 'What’s the bar’s name, and where is it? Anything else Quentin should know?',
      offerMessage: true,
      keywords: [
        'my bar',
        'add my bar',
        'add a bar',
        'list my bar',
        'our bar',
        'bar owner',
        'taproom',
        'my brewery',
        'our brewery',
        'brewery',
        'craft beer bar',
        'tap list',
      ],
    },
    {
      id: 'business',
      ask: 'A business inquiry about an app',
      answer:
        'Quentin is happy to talk business about the apps: advertising or a festival listing on FestCompass, adding your bar to TapLog (Quentin does this often), a partnership with Ikitai or Fairmints, or anything else you have in mind. Tell me which app and what you’d like, and Quentin will reply by email.',
      prompt: 'Which app, and what do you have in mind? A few lines are enough.',
      offerMessage: true,
      keywords: [
        'advertise',
        'advertising',
        'advert',
        'ads',
        'ad',
        'sponsor',
        'sponsoring',
        'sponsorship',
        'partner',
        'partnership',
        'listing',
        'list my',
        'add my',
        'my festival',
        'my event',
        'venue',
        'organizer',
        'organiser',
        'promote',
        'promotion',
        'marketing',
        'business',
        'commercial',
        'pricing',
        'licensing',
      ],
    },
    {
      id: 'now',
      ask: 'What are you building now?',
      answer:
        'Four products, all built and run by Quentin: Ikitai turns screenshots into plans (in App Store review), Fairmints is for creating and trading on Bitcoin, FestCompass finds festivals in Japan, and TapLog shows live tap lists for Tokyo craft bars.',
      link: { label: 'See the projects', to: '/#projects' },
      keywords: [
        'building',
        'build',
        'product',
        'products',
        'project',
        'projects',
        'working on',
        ...shared.now,
      ],
    },
    {
      id: 'stack',
      ask: 'What’s your stack?',
      answer:
        'Mostly Vue 3 and TypeScript, with NestJS behind them and Capacitor for iOS and Android from the same code. Data lives in PostgreSQL or SQLite, through Prisma or TypeORM. Every change comes with tests.',
      link: { label: 'All skills', to: '/quentin#skills' },
      keywords: [
        'stack',
        'tech',
        'technology',
        'technologies',
        'framework',
        'frontend',
        'front end',
        'backend',
        'back end',
        'mobile',
        'skills',
        ...shared.stack,
      ],
    },
    {
      id: 'background',
      ask: 'What’s your background?',
      answer:
        '14 years building web applications, and 8 years as a CEO and co-founder. At Ownest, supply-chain software used by Saint Laurent and Cdiscount, Quentin led the product team as the company grew to 20 people. Before that came Ledgys, and CryptoFR, a French Bitcoin community started in 2014.',
      link: { label: 'Experience', to: '/quentin#experience' },
      keywords: [
        'background',
        'experience',
        'career',
        'cv',
        'resume',
        'résumé',
        'history',
        'past',
        'ownest',
        'ledgys',
        'cryptofr',
        'founder',
        'ceo',
        'education',
        'degree',
      ],
    },
    {
      id: 'location',
      ask: 'Where are you based?',
      answer:
        'In Tokyo, building for Japan: FestCompass covers festivals across the country and TapLog covers Tokyo’s craft beer bars, both in Japanese and English. Quentin speaks French (native) and English, and is studying Japanese toward JLPT N2.',
      link: { label: 'About Quentin', to: '/quentin' },
      keywords: [
        'where',
        'based',
        'tokyo',
        'japan',
        'live',
        'located',
        'location',
        'remote',
        'speak',
        'languages',
        'japanese',
        'french',
        'english',
      ],
    },
    {
      id: 'ai',
      ask: 'How do you work with AI?',
      answer:
        'Claude Code, Codex and Grok take tasks in parallel and hand work to each other through an agent network. Each task has acceptance criteria and tests, Quentin reads every diff before it merges, and agents never deploy on their own.',
      link: { label: 'How Quentin builds', to: '/quentin#workflow' },
      keywords: ['workflow', 'process', 'how do you build', 'how you build', ...shared.ai],
    },
    {
      id: 'reach',
      ask: 'How else can I reach you?',
      answer:
        'Quentin is on LinkedIn, GitHub and X; the links are just below. Or send a message here, and Quentin will reply by email.',
      offerMessage: true,
      keywords: ['contact', 'reach', 'call', 'phone', 'social', ...shared.reach],
    },
    {
      id: 'hello',
      ask: 'Hello!',
      answer: 'Hello! What would you like to know?',
      keywords: ['hi', 'hello', 'hey', 'yo', 'bonjour', 'salut'],
    },
  ],
  unknown: 'I don’t know that one, but Quentin does. Want to send it as a message?',
  sendIt: 'Send it to Quentin',
  somethingElse: 'Ask something else',
  writeMessage: 'Send Quentin a message',
  askName: 'Great. What’s your name?',
  askEmail: (name) => `Thanks, ${name}. What’s your email, so Quentin can reply?`,
  badEmail: 'That email doesn’t look right. Could you check it?',
  askMessage: 'What would you like to say?',
  askDraft: 'Here’s your question. Send it as it is, or add a few words.',
  sent: 'Sent! Quentin will reply by email.',
  cancelled: 'No problem. Anything else?',
  tryAgain: 'Try again',
};

const ja: BotContent = {
  greeting:
    'こんにちは！このサイトのアシスタントです。Quentinの仕事について聞いてください。Quentinへのメッセージも送れます。',
  suggested: ['work', 'business', 'now', 'stack', 'background', 'location'],
  topics: [
    {
      id: 'work',
      ask: '仕事をお願いできますか？',
      answer:
        'はい！Quentinはいま、東京でのフロントエンド／フルスタックの正社員のポジションと、フリーランス・業務委託の案件を受け付けています。内容を少し教えてください。Quentinからメールで返信します。',
      prompt: 'ポジションや案件について教えてください。数行で大丈夫です。',
      offerMessage: true,
      keywords: [
        '仕事',
        '採用',
        '依頼',
        'フリーランス',
        '業務委託',
        '求人',
        '転職',
        '雇',
        '案件',
        '募集',
        'ポジション',
        'お願い',
        'job',
        'work',
        'hire',
        'freelance',
      ],
    },
    {
      id: 'bar',
      ask: 'TapLogに自分のバーを載せられますか？',
      answer:
        'はい！QuentinはTapLogにバーをよく追加しています。まずご連絡いただき、相談したうえでQuentinが登録します。お店について教えてください。Quentinからメールで返信します。',
      prompt: 'お店の名前と場所を教えてください。ほかに伝えたいことがあればどうぞ。',
      offerMessage: true,
      keywords: [
        'お店',
        'うちのバー',
        '自分のバー',
        'バーを',
        '店舗',
        '載せ',
        'ブルワリー',
        '醸造所',
        'タップルーム',
        'タップリスト',
        'my bar',
        'brewery',
      ],
    },
    {
      id: 'business',
      ask: 'アプリについてのビジネスのご相談',
      answer:
        'アプリについてのビジネスのご相談は大歓迎です。FestCompassへの広告やフェスの掲載、TapLogへのバーの追加（よく対応しています）、IkitaiやFairmintsとの提携など、なんでもどうぞ。どのアプリで何をしたいか教えてください。Quentinからメールで返信します。',
      prompt: 'どのアプリで、どんなことをお考えですか？数行で大丈夫です。',
      offerMessage: true,
      keywords: [
        '広告',
        '掲載',
        'スポンサー',
        '提携',
        '協業',
        'パートナー',
        '主催',
        '宣伝',
        'プロモーション',
        'ビジネス',
        '法人',
        '料金',
        '追加',
        'advertising',
        'sponsor',
      ],
    },
    {
      id: 'now',
      ask: 'いま何をつくっていますか？',
      answer:
        'Quentinが一人で開発・運営している4つのプロダクトです。スクショを予定に変えるIkitai（App Store審査中）、ビットコインでつくって取引するFairmints、日本のフェスを探すFestCompass、東京のクラフトビアバーのいまのタップリストがわかるTapLogです。',
      link: { label: 'プロジェクトを見る', to: '/#projects' },
      keywords: ['つく', '作', 'プロダクト', 'プロジェクト', '開発中', ...shared.now],
    },
    {
      id: 'stack',
      ask: '技術スタックは？',
      answer:
        '主にVue 3とTypeScriptで、バックエンドはNestJS、iOS・AndroidはCapacitorで同じコードからつくっています。データはPrismaやTypeORMを通してPostgreSQLかSQLiteに。すべての変更にテストがつきます。',
      link: { label: 'スキル一覧', to: '/quentin#skills' },
      keywords: [
        'スタック',
        '技術',
        'フレームワーク',
        'フロントエンド',
        'バックエンド',
        'スキル',
        '言語',
        ...shared.stack,
      ],
    },
    {
      id: 'background',
      ask: 'これまでの経歴は？',
      answer:
        'Webアプリケーション開発は14年、CEO・共同創業者として8年。サンローランやCdiscountが使うサプライチェーンのソフトウェアOwnestでは、会社が20人規模になるまでプロダクトチームを率いました。その前はLedgys、そして2014年に立ち上げたフランスのビットコインコミュニティCryptoFRです。',
      link: { label: '経歴', to: '/quentin#experience' },
      keywords: [
        '経歴',
        '経験',
        '職歴',
        'キャリア',
        '履歴',
        '学歴',
        'これまで',
        'ownest',
        'ledgys',
        'cryptofr',
        'ceo',
      ],
    },
    {
      id: 'location',
      ask: 'どこに住んでいますか？',
      answer:
        '東京に住み、日本向けにプロダクトをつくっています。FestCompassは全国のフェスを、TapLogは東京のクラフトビアバーを、日本語と英語で届けています。フランス語（母語）と英語を話し、日本語はJLPT N2に向けて学習中です。',
      link: { label: 'プロフィール', to: '/quentin' },
      keywords: [
        'どこ',
        '拠点',
        '住',
        '東京',
        '日本',
        'リモート',
        '日本語',
        'フランス語',
        '英語',
        '話せ',
      ],
    },
    {
      id: 'ai',
      ask: 'AIとはどう開発していますか？',
      answer:
        'Claude Code、Codex、Grokが並行してタスクを担い、エージェントネットワークを通じて作業を引き継ぎます。タスクごとに受け入れ条件とテストを決め、マージ前にはQuentinがすべての差分を読みます。エージェントが単独でデプロイすることはありません。',
      link: { label: '開発の進め方', to: '/quentin#workflow' },
      keywords: ['エージェント', '開発の進め方', 'ワークフロー', 'プロセス', ...shared.ai],
    },
    {
      id: 'reach',
      ask: 'ほかの連絡方法は？',
      answer:
        'LinkedIn、GitHub、Xにいます。リンクはすぐ下にあります。ここからメッセージを送れば、Quentinからメールで返信します。',
      offerMessage: true,
      keywords: ['連絡', '問い合わせ', 'メール', 'sns', '電話', ...shared.reach],
    },
    {
      id: 'hello',
      ask: 'こんにちは！',
      answer: 'こんにちは！何が知りたいですか？',
      keywords: ['こんにちは', 'はじめまして', 'こんばんは', 'おはよう', 'hi', 'hello'],
    },
  ],
  unknown: 'それはわかりませんが、Quentinなら答えられます。メッセージとして送りますか？',
  sendIt: 'Quentinに送る',
  somethingElse: 'ほかの質問をする',
  writeMessage: 'Quentinにメッセージを送る',
  askName: 'ありがとうございます。お名前を教えてください。',
  askEmail: (name) =>
    `${name}さん、ありがとうございます。Quentinが返信できるよう、メールアドレスを教えてください。`,
  badEmail: 'メールアドレスが正しくないようです。確認していただけますか？',
  askMessage: 'メッセージをどうぞ。',
  askDraft: 'いただいた質問です。このまま送るか、少し書き足してください。',
  sent: '送信しました！Quentinからメールで返信します。',
  cancelled: 'わかりました。ほかに何かありますか？',
  tryAgain: 'もう一度試す',
};

export const botContent: Record<Locale, BotContent> = { en, ja };

/** The topic a typed question is about, or null when the assistant doesn't know. */
export function matchTopic(content: BotContent, question: string): Topic | null {
  const text = question.toLowerCase();
  let best: { topic: Topic; score: number } | null = null;
  for (const topic of content.topics) {
    let score = 0;
    for (const keyword of topic.keywords) {
      const found = /^[a-z0-9 ]+$/.test(keyword)
        ? new RegExp(`(^|[^a-z0-9])${keyword}($|[^a-z0-9])`).test(text)
        : text.includes(keyword);
      if (found) score += keyword.length > 3 || !/^[a-z0-9 ]+$/.test(keyword) ? 2 : 1;
    }
    if (score && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic ?? null;
}
