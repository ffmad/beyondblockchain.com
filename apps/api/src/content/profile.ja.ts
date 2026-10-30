import type { Profile } from '@beyond/shared';

const ownestStory = { label: 'Ownestの歩み', url: 'https://ownest.io/en/about/our-story' };

export const profileJa: Profile = {
  name: 'Quentin de Beauchesne',
  handle: 'ffmad',
  intro:
    '2014年にCryptoFRを立ち上げ、2017年にOwnestを共同創業しました。現在は、自分のスタジオBeyond Blockchainで、Ikitai、Fairmints、FestCompass、TapLogを開発しています。',
  focus:
    '創業者であり、開発者です。最近は、日々の予定づくりに役立つAI、ビットコインのツール、そして日本のフェス探しに取り組んでいます。',
  artefacts: [
    {
      id: 'cryptofr',
      kicker: 'Bitcoin.fr · 2015',
      title: 'CryptoFRの立ち上げ',
      note: '2014年、フランス語圏のビットコインとブロックチェーンのコミュニティ「CryptoFR」を立ち上げました。2015年1月には、フォーラムを築き、そこでの議論をミートアップへと広げていったことについて、Bitcoin.frのインタビューを受けました。',
      source: {
        label: 'Bitcoin.frでインタビューを読む（フランス語）',
        url: 'https://bitcoin.fr/cryptofr/',
      },
    },
    {
      id: 'vitalik',
      kicker: 'Ethereum France · 2016',
      title: 'ヴィタリック・ブテリンとの対話',
      note: 'イーサリアムの生みの親に聞いた前後編のインタビューに、Ethereum FranceおよびCryptoFRコミュニティのメンバーとともに携わりました。',
      source: {
        label: 'インタビューを読む（フランス語）',
        url: 'https://www.ethereum-france.com/blog/interview-de-vitalik-buterin-createur-dethereum-et-president-de-la-fondation-partie-1-sur-2/',
      },
    },
    {
      id: 'ownest',
      kicker: 'Ownest · 2017–2026',
      title: 'サプライチェーンのためのソフトウェア',
      note: 'Ownestを共同創業し、モノが移動するあいだ誰がその責任を負っているかを追跡するブロックチェーンソフトウェアに、8年間取り組みました。技術面では、Polygon、Vue、NestJSを組み合わせました。',
      image: {
        src: '/story/ownest-mobile.png',
        alt: '責任の引き渡しを確認するOwnestのモバイル画面。',
        width: 269,
        height: 522,
      },
      source: ownestStory,
    },
    {
      id: 'nakamotos',
      kicker: 'The Nakamotos Club',
      title: 'Rare Pepe Nakamotoカード',
      note: 'The Nakamotos Clubを創設しました。オリジナルのRare Pepe Nakamotoカードについて、ビットコイン上での来歴、コレクター、そしてポートレートを扱うプロジェクトです。',
      image: {
        src: '/story/nakamoto-card.svg',
        alt: 'The Nakamotos Clubで紹介されている、オリジナルのRare Pepe Nakamotoトレーディングカード。',
        width: 379,
        height: 530,
      },
      source: {
        label: 'NFT Factoryの創設メンバー紹介',
        url: 'https://nftfactoryparis.com/founders',
      },
    },
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
  experience: [
    {
      name: 'CryptoFR',
      year: '2014',
      period: '2014年に創設',
      role: '創設者',
      description:
        'フランス語圏のビットコインとブロックチェーンのコミュニティをつくりました。最初はフォーラムから始め、その後ミートアップを開いて、議論を実際に顔を合わせる場へと広げました。',
      url: 'https://cryptofr.com',
    },
    {
      name: 'Ledgys',
      year: '2016',
      period: '2016年2月〜2017年11月',
      role: '共同創業者・CEO',
      description:
        'イーサリアムを基盤に、分散型マーケットプレイスを通じたデータ共有を探るため、Ledgysを共同創業しました。',
    },
    {
      name: 'Ownest',
      year: '2017',
      period: '2017年12月〜2026年3月',
      role: 'CEO・共同創業者',
      description:
        'サプライチェーン全体にわたって、所有権と責任の所在を追跡するブロックチェーンソフトウェアです。技術面では、Polygon、Vue、NestJSを組み合わせました。',
      url: 'https://ownest.io',
    },
    {
      name: 'Fairmints',
      year: '2024',
      period: '2024年〜現在',
      role: '現在のプロジェクト',
      description:
        'ビットコインネイティブなトークンやNFTを作成・ミント・取引できるプラットフォームです。マーケット、スワップ、エクスプローラーの各ツールを備えています。',
      url: 'https://fairmints.io',
    },
    {
      name: 'Ikitai、FestCompass、TapLog',
      year: '2026',
      period: '2026年〜現在',
      role: '単独創業者',
      description:
        'FestCompass（2026年7月から）は、日本のフェスガイドです。TapLog（2026年8月から）は、東京のクラフトビアバーのタップリストを届けます。Ikitai（2026年10月から）は、保存しておいたアイデアを友だちとの予定に変えるAIアプリです。',
      url: '/',
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
  community: [
    {
      name: 'AMF・個人投資家諮問委員会',
      description:
        'フランス金融市場庁（AMF）の個人投資家諮問委員会（Commission consultative Épargnants）に、Association CryptoFRの代表として参加しています。',
      source: {
        label: '公式の委員会メンバー一覧（フランス語）',
        url: 'https://www.amf-france.org/fr/lamf/notre-organisation/les-commissions-consultatives',
      },
    },
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
        '2017年2月にパリで開催された欧州イーサリアム開発者会議（European Ethereum Development Conference）の準備にあたり、運営チームをサポートしました。',
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
  socials: [
    { label: 'GitHub', url: 'https://github.com/ffmad' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/qdebeauchesne/' },
    { label: 'X', url: 'https://x.com/quentinbdb' },
  ],
};
