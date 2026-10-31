import type { Profile } from '@beyond/shared';

const ownestStory = { label: 'Ownestの歩み', url: 'https://ownest.io/en/about/our-story' };

export const profileJa: Profile = {
  name: 'Quentin de Beauchesne',
  handle: 'ffmad',
  headline: 'フロントエンド／フルスタックエンジニア · Vue 3、TypeScript、NestJS · AIを活用した開発',
  intro:
    '14年にわたりJavaScriptとTypeScriptでWebアプリケーションをつくり、8年間は共同創業者として、エンジニアリングの体制をゼロから築いてきました。現在は東京の自分のスタジオBeyond Blockchainで、Web・iOS・Android向けのVue 3フロントエンドと、NestJSのバックエンドを開発しています。',
  home: '東京に住み、日本のためにプロダクトをつくっています。FestCompassは全国のフェスを、TapLogは東京のクラフトビアバーを、日本語と英語で届けています。',
  focus:
    '目指しているのは、最高のUI/UX。直感的で、使いやすく、使っていて心地よいアプリです。毎日AIコーディングエージェント（Claude Code、Codex、Grok）と開発し、すべての変更を自分でレビューしています。',
  glance: [
    { label: '拠点', value: '東京' },
    { label: '対象市場', value: '日本（FestCompass、TapLog）' },
    { label: '目指すもの', value: '直感的で使いやすく、心地よいUI/UX' },
    {
      label: '現在',
      value:
        'ブロックチェーンのアプリ（Fairmints）と、その先のアプリ（Ikitai、FestCompass、TapLog）を開発',
    },
    { label: 'これまで', value: 'Ownest 共同創業者。20人規模まで成長（2017〜2026年）' },
    {
      label: '開発',
      value: 'Vue 3、TypeScript、NestJS、AIコーディングエージェント',
    },
    {
      label: '言語',
      value: 'フランス語（母語）、英語（ビジネス）、日本語（JLPT N2に向けて学習中）',
    },
    { label: '学歴', value: 'ENSEM 技術者学位（修士相当）' },
  ],
  now: [
    {
      name: 'Ikitai',
      since: '2026年10月から',
      description: 'スクリーンショットや保存したリンクを、友だちとの予定に変えるAIアプリです。',
      url: '/work/ikitai',
    },
    {
      name: 'Fairmints',
      since: '2024年から',
      description:
        'ビットコインネイティブなトークンやNFTを作成・ミント・取引できるプラットフォームです。',
      url: '/work/fairmints',
    },
    {
      name: 'FestCompass',
      since: '2026年7月から',
      description:
        '日本のフェスに参加する人のために、フェス探しとスケジュールづくりをサポートします。',
      url: '/work/festcompass',
    },
    {
      name: 'TapLog',
      since: '2026年8月から',
      description: '東京のクラフトビアバーの、いまのタップリスト。飲んだビールの記録もできます。',
      url: '/work/taplog',
    },
  ],
  workflow: [
    { title: 'ブリーフ', text: 'タスクごとに、受け入れ条件を決めます。' },
    {
      title: '並行するエージェント',
      text: 'Claude Code、Codex、Grokが別々のタスクを担い、エージェントネットワークを通じて作業を引き継ぎます。',
    },
    {
      title: 'レビュー',
      text: 'マージ前にすべての差分を読みます。エージェントが単独でデプロイすることはありません。',
    },
    {
      title: 'フィードバック',
      text: '繰り返されるミスは、エージェントへの指示のルールにします。',
    },
  ],
  workflowNote:
    'Ikitaiは最初の2週間で、148コミットに達しました（2026年10月30日時点のリポジトリより）。',
  experience: [
    {
      name: 'Beyond Blockchain',
      year: '2026',
      period: '2026年7月〜現在',
      role: '創業者・プロダクトエンジニア',
      place: '東京',
      description:
        '一人で運営するスタジオです。Ikitai、FestCompass、TapLog、そしてこのサイトを開発・運営しています。いずれもWeb・iOS・Android向けのVue 3アプリで、バックエンドはNestJSです。その裏側のマルチエージェントの開発体制も自分で構築しました。Claude Code、Codex、Grokが並行してタスクを担い、エージェントネットワークとジョブボードを通じて作業を引き継ぎます。リサーチとコンテンツには15のGrokボットを使っています。',
      url: '/',
    },
    {
      name: 'Fairmints',
      year: '2024',
      period: '2024年10月〜現在',
      role: '創業者',
      place: '東京',
      description:
        'ビットコインネイティブのトークンやNFTを発行・取引できるプラットフォームです。Alkanesプロトコル上のマーケット、AMM、エクスプローラーに加え、Counterparty（XCP）のアセットにも対応し、英語・日本語・中国語で提供しています。Vue 3、Tailwind CSS、Three.js、NestJS、Socket.IO、bitcoinjs-libで開発しました。',
      url: 'https://fairmints.io',
    },
    {
      name: 'Ownest',
      year: '2017',
      period: '2017年12月〜2026年3月',
      role: '共同創業者（最後の3年間はCEO）',
      place: 'パリ',
      description:
        'NFTによる追跡で、サプライチェーンのどこで誰がモノの責任を負っているかをたどるSaaSです。Vue、NestJS、Polygonにわたる技術アーキテクチャを担い、会社が20人規模に成長するなかでプロダクトチームを採用し、率いました。顧客には、サンローラン、Orange、カルフール、Bouyguesなど、フランスの大手企業がいました。',
      url: 'https://ownest.io',
    },
    {
      name: 'Ledgys',
      year: '2016',
      period: '2016年2月〜2017年11月',
      role: '共同創業者・CEO',
      place: 'パリ',
      description:
        '分散型マーケットプレイスによる、イーサリアムベースのデータ共有に取り組みました。',
    },
    {
      name: 'CryptoFR',
      year: '2014',
      period: '2014年〜現在',
      role: '創業者',
      description:
        'フランス語圏のビットコインとブロックチェーンのコミュニティです。MongoDBとRedisを使ったNode.jsのフォーラムから始まり、議論を同じ場に集めるミートアップへと広がりました。',
      url: 'https://cryptofr.com',
    },
    {
      name: 'Avisto',
      year: '2012',
      period: '2012年11月〜2016年1月',
      role: 'Web開発者',
      place: 'カシャン',
      description:
        'Symfony、eZ Publish、jQuery Mobileを使い、クライアント向けのWebサイトやWebアプリケーションを開発しました。',
    },
    {
      name: 'CommOnEcoute',
      year: '2012',
      period: '2012年3月〜8月',
      role: 'Web開発インターン',
      place: 'パリ',
      description: 'jQueryで、Webアプリケーションのフロントエンドを担当しました。',
    },
  ],
  achievements: [
    {
      year: '2021',
      title: '実証実験から本格導入へ',
      description:
        'フランスのEC大手Cdiscountが、年間250万個の大型荷物を対象とする荷物追跡の導入に向けて、Ownestと3年間の契約を締結しました。',
      source: ownestStory,
    },
    {
      year: '2021',
      title: 'LSA Retail Tech Live',
      description: 'Ownestが2020年版のTransformation賞を受賞しました（授与は2021年1月）。',
      source: ownestStory,
    },
    {
      year: '2018',
      title: 'Ownestへの評価',
      description:
        'Orange Consulting TechOffの審査員賞と、SITL Europeの審査員によるCoup de Cœur賞を受賞しました。さらにEasy Shoppingでは、フランスの郵便事業者La PosteとともにSirius Business Transformation賞に選ばれました。',
      source: ownestStory,
    },
  ],
  skills: [
    { area: 'プログラミング言語', items: 'TypeScript、JavaScript、HTML/CSS' },
    {
      area: 'フロントエンド',
      items:
        'Vue.js 3（Composition API、Pinia、Vue Router、vue-i18n、サーバーサイドレンダリング）、Vite、Tailwind CSS、Three.js',
    },
    {
      area: 'バックエンド・API',
      items: 'NestJS、Express、REST APIの設計、TypeORM、Prisma、PostgreSQL、SQLite、Socket.IO',
    },
    { area: 'モバイル', items: 'Capacitorで、ひとつのVueコードベースからiOS・Androidアプリ' },
    { area: 'テスト', items: 'Jest、Vitest、Playwright' },
    {
      area: 'デリバリー・ホスティング',
      items: 'Docker、GitHub Actions、Cloudflare、Firebase、Supabase、AWS',
    },
    { area: '多言語対応', items: '英語・日本語・中国語などでアプリを提供' },
    {
      area: 'AI',
      items: '開発にClaude Code、Codex、Grok。プロダクトの機能にClaude APIとGemini API',
    },
    {
      area: 'ブロックチェーン',
      items:
        'ビットコイン（Counterparty、Alkanes、bitcoinjs-lib）、イーサリアムとPolygon、Solidity、Rustのコントラクト',
    },
  ],
  community: [
    {
      name: 'La Chaintech',
      description:
        'フランスでブロックチェーンに携わる人々をつなぐため、2016年6月に共同設立しました。',
      source: {
        label: '創設チームのストーリー（フランス語）',
        url: 'https://theblockchainforgood.org/index.php/2019/01/06/blockchain-et-chaine-logistique-suivre-les-objets-ou-rendre-responsables-les-gens-qui-les-suivent/',
      },
    },
    {
      name: 'NFT Factory Paris',
      description:
        'アート、テクノロジー、Web3の分野をまたいで人々をつなぐコレクティブの創設メンバーです。',
      source: {
        label: 'コレクティブのメンバーを見る',
        url: 'https://nftfactoryparis.com/founders',
      },
    },
    {
      name: 'EDCON・パリ（2017年）',
      description:
        '2017年2月にパリで開催されたEDCON（欧州イーサリアム開発者会議）の準備で、運営チームをサポートしました。',
      source: {
        label: 'Ethereum Franceによるイベントレポート（フランス語）',
        url: 'https://www.ethereum-france.com/blog/retour-sur-ledcon-premiere-conference-europeenne-sur-ethereum-17-18-fevrier-2017/',
      },
    },
  ],
  additionalProjects: [
    {
      name: 'The Nakamotos Club',
      role: '創設者',
      description:
        'オリジナルのRare Pepe Nakamotoカードをめぐるプロジェクトです。ビットコイン上でのカード一枚一枚の来歴、コレクター、そしてそれらを表すポートレートを扱っています。',
      url: 'https://thenakamotos.club',
      logoUrl: '/story/nakamotos-logo.png',
      imageUrl: '/story/nakamoto-card.svg',
      imageAlt:
        'The Nakamotos Clubで紹介されている、オリジナルのRare Pepe Nakamotoトレーディングカード。',
      source: {
        label: 'NFT Factoryの創設メンバー紹介',
        url: 'https://nftfactoryparis.com/founders',
      },
    },
    {
      name: 'Onigiri',
      role: 'スマートコントラクトとコミュニティ',
      description:
        '日本のRare PepeアーティストONI-GIRIの作品です。2017年にビットコイン上で9枚のRare Pepeを制作し、2022年には独自のスタイルで描いた6,198体のOnigiri PepesをEthereumで発表しました。NFTコレクションのスマートコントラクトづくりと、コミュニティの運営を手伝いました。',
      url: 'https://onigiri.art',
      logoUrl: '/story/onigiri-logo.svg',
      source: { label: 'ONI-GIRIのプロフィール', url: 'https://onigiri.art/ja/about' },
    },
  ],
  publicWork: [
    {
      year: '2024',
      kind: '対話',
      title: '食料・水・エネルギーとサプライチェーン',
      description:
        'EthCC期間中に収録された、ブリュッセルのBlockchain for Good Unconferenceでのオープンな対話です。',
      source: {
        label: '対話を聴く',
        url: 'https://event.theblockchainforgood.org/index.php/2024/07/16/bfgu2-food-water-energy-supply-chain/',
      },
    },
    {
      year: '2022',
      kind: 'インタビュー・フランス語',
      title: 'B SMARTでOwnestを語る',
      description:
        '番組「Instant Bitcoin」で、Nicolas Pagniez氏、Eva Ben-Saadi氏とOwnestについて話しました。',
      source: {
        label: 'インタビューを見る（フランス語）',
        url: 'https://www.bsmart.fr/video/15266-instant-bitcoin-partie-26-aout-2022',
      },
    },
    {
      year: '2022',
      kind: '講演',
      title: 'サプライチェーンのためのNFT',
      description:
        'EthCC[5]で、物理的なモノとともに責任を受け渡すOwnestのアプローチを発表しました。',
      source: {
        label: '講演のまとめを読む',
        url: 'https://fr.linkedin.com/posts/ownest_ethcc5-ethcc-ethereum-activity-6955458285676150784--OKV',
      },
    },
    {
      year: '2021',
      kind: '記事',
      title: 'NFTs for Supplychain',
      description:
        '責任の追跡になぜNFTを使ったのか、そして「ホットポテト」モデルがどう機能するのかを解説しています。',
      source: {
        label: 'Mediumで読む',
        url: 'https://medium.com/ownest/nfts-for-supplychain-29eefa395265',
      },
    },
    {
      year: '2016',
      kind: 'インタビュー・フランス語',
      title: 'ヴィタリック・ブテリンとの対話',
      description:
        'Ethereum FranceおよびCryptoFRコミュニティのメンバーとともに、実施に携わったインタビューです。',
      source: {
        label: 'インタビューを読む（フランス語）',
        url: 'https://www.ethereum-france.com/blog/interview-de-vitalik-buterin-createur-dethereum-et-president-de-la-fondation-partie-1-sur-2/',
      },
    },
    {
      year: '2015',
      kind: 'インタビュー・フランス語',
      title: 'CryptoFRの立ち上げ',
      description:
        'フランス語圏のクリプトコミュニティを立ち上げ、フォーラムを築き、議論をミートアップへと広げていったことについて語りました。',
      source: {
        label: 'Bitcoin.frで読む（フランス語）',
        url: 'https://bitcoin.fr/cryptofr/',
      },
    },
  ],
  contributions: [
    {
      year: '現在',
      title: 'AMF・個人投資家諮問委員会',
      description:
        'フランス金融市場庁（AMF）の個人投資家諮問委員会（Commission consultative Épargnants）に、Association CryptoFRの代表として参加しています。',
      source: {
        label: '公式の委員会メンバー一覧（フランス語）',
        url: 'https://www.amf-france.org/fr/lamf/notre-organisation/les-commissions-consultatives',
      },
    },
    {
      year: '2021',
      title: 'ACPR・AMF フィンテックフォーラム',
      description:
        'フランスの金融監督当局ACPRとAMFによるフォーラムで、暗号資産関連事業者の銀行口座へのアクセスを扱うワーキンググループに、Association CryptoFRの代表として参加しました。',
      source: {
        label: 'ワーキンググループ報告書（フランス語）',
        url: 'https://acpr.banque-france.fr/system/files/import/acpr/medias/documents/20210324_gtacces_cptes_crypto_crtravaux.pdf',
      },
    },
    {
      year: '2019',
      title: 'フランス国民議会',
      description:
        '仮想通貨に関する調査ミッションのヒアリングに、Ownestの代表として参加しました。2019年1月の同ミッションの報告書に記載されています。',
      source: {
        label: '国民議会の報告書（フランス語）',
        url: 'https://www.assemblee-nationale.fr/dyn/docs/RINFANR5L15B1624.raw',
      },
    },
  ],
  education: [
    {
      years: '2008〜2012',
      school: 'ENSEM（ロレーヌ国立理工科学院）',
      detail: '技術者学位（修士相当）、総合工学・情報システムコース',
    },
  ],
  languages: 'フランス語（母語）· 英語（ビジネス）· 日本語（JLPT N2に向けて学習中）',
  socials: [
    { label: 'GitHub', url: 'https://github.com/ffmad' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/qdebeauchesne/' },
    { label: 'X', url: 'https://x.com/quentinbdb' },
  ],
};
