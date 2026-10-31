import {
  siBitcoin,
  siCapacitor,
  siChartdotjs,
  siClaude,
  siEthereum,
  siGooglegemini,
  siMaplibre,
  siMongodb,
  siNestjs,
  siNodedotjs,
  siPolygon,
  siPostgresql,
  siRedis,
  siSocketdotio,
  siSolidity,
  siSqlite,
  siSupabase,
  siTailwindcss,
  siThreedotjs,
  siTypeorm,
  siVite,
  siVuedotjs,
} from 'simple-icons';
import type { Locale } from '@beyond/shared/metadata.js';

// What each technology in the projects' stacks is, with its logo (from Simple Icons, CC0) where one exists.
// A technology missing here still shows, with its initials and no description.

export interface TechIcon {
  path: string;
  hex: string;
}
interface TechInfo {
  icon: TechIcon | null;
  what: Record<Locale, string>;
}

const icon = ({ path, hex }: { path: string; hex: string }): TechIcon => ({ path, hex });

const catalogue: Record<string, TechInfo> = {
  'Vue 3': {
    icon: icon(siVuedotjs),
    what: {
      en: 'JavaScript framework for building interfaces',
      ja: 'UIをつくるJavaScriptフレームワーク',
    },
  },
  Vue: {
    icon: icon(siVuedotjs),
    what: {
      en: 'JavaScript framework for building interfaces',
      ja: 'UIをつくるJavaScriptフレームワーク',
    },
  },
  Vite: {
    icon: icon(siVite),
    what: {
      en: 'Build tool and dev server for the front end',
      ja: 'フロントエンドのビルドツールと開発サーバー',
    },
  },
  Capacitor: {
    icon: icon(siCapacitor),
    what: {
      en: 'Turns one web codebase into iOS and Android apps',
      ja: 'ひとつのウェブのコードからiOS・Androidアプリをつくる',
    },
  },
  NestJS: {
    icon: icon(siNestjs),
    what: {
      en: 'Node.js framework for APIs and back ends',
      ja: 'APIとバックエンドのためのNode.jsフレームワーク',
    },
  },
  TypeORM: {
    icon: icon(siTypeorm),
    what: {
      en: 'Maps TypeScript classes to database tables',
      ja: 'TypeScriptのクラスをデータベースに対応づけるORM',
    },
  },
  Supabase: {
    icon: icon(siSupabase),
    what: {
      en: 'Hosted Postgres with sign-in and storage',
      ja: '認証とストレージ付きのPostgresホスティング',
    },
  },
  PostgreSQL: {
    icon: icon(siPostgresql),
    what: { en: 'Relational database', ja: 'リレーショナルデータベース' },
  },
  'Claude API': {
    icon: icon(siClaude),
    what: {
      en: 'Anthropic’s AI models, built into the product',
      ja: 'プロダクトに組み込んだAnthropicのAIモデル',
    },
  },
  'Tailwind CSS': {
    icon: icon(siTailwindcss),
    what: { en: 'Utility-first CSS framework', ja: 'ユーティリティファーストのCSSフレームワーク' },
  },
  'Three.js': {
    icon: icon(siThreedotjs),
    what: {
      en: '3D graphics in the browser, with WebGL',
      ja: 'WebGLでブラウザに3Dを描くライブラリ',
    },
  },
  SQLite: {
    icon: icon(siSqlite),
    what: { en: 'A whole database in a single file', ja: '1つのファイルで動くデータベース' },
  },
  'Socket.IO': {
    icon: icon(siSocketdotio),
    what: {
      en: 'Real-time updates between server and browser',
      ja: 'サーバーとブラウザのリアルタイム通信',
    },
  },
  'MapLibre GL': {
    icon: icon(siMaplibre),
    what: { en: 'Open-source interactive maps', ja: 'オープンソースのインタラクティブ地図' },
  },
  Mux: {
    icon: null,
    what: { en: 'Video upload, encoding and streaming', ja: '動画のアップロード・変換・配信' },
  },
  'Gemini API': {
    icon: icon(siGooglegemini),
    what: {
      en: 'Google’s AI models, used to read photos and text',
      ja: '写真や文字の読み取りに使うGoogleのAIモデル',
    },
  },
  Polygon: {
    icon: icon(siPolygon),
    what: { en: 'Ethereum-compatible blockchain', ja: 'イーサリアム互換のブロックチェーン' },
  },
  Ethereum: {
    icon: icon(siEthereum),
    what: {
      en: 'Blockchain for smart contracts',
      ja: 'スマートコントラクトのためのブロックチェーン',
    },
  },
  Solidity: {
    icon: icon(siSolidity),
    what: {
      en: 'Language for Ethereum smart contracts',
      ja: 'イーサリアムのスマートコントラクトの言語',
    },
  },
  Hardhat: {
    icon: null,
    what: {
      en: 'Tools to build, test and deploy smart contracts',
      ja: 'スマートコントラクトの開発・テスト・デプロイのツール',
    },
  },
  'Chart.js': {
    icon: icon(siChartdotjs),
    what: { en: 'Charts for web pages', ja: 'Webページのグラフ' },
  },
  'Node.js': {
    icon: icon(siNodedotjs),
    what: { en: 'JavaScript on the server', ja: 'サーバーで動くJavaScript' },
  },
  MongoDB: {
    icon: icon(siMongodb),
    what: { en: 'Document database', ja: 'ドキュメント指向データベース' },
  },
  Redis: {
    icon: icon(siRedis),
    what: { en: 'In-memory data store', ja: 'インメモリのデータストア' },
  },
  'bitcoinjs-lib': {
    icon: icon(siBitcoin),
    what: {
      en: 'Builds and signs Bitcoin transactions in JavaScript',
      ja: 'JavaScriptでビットコインの取引をつくり、署名する',
    },
  },
  'bip322-js': {
    icon: icon(siBitcoin),
    what: {
      en: 'Verifies Bitcoin signed messages (BIP-322)',
      ja: 'ビットコインの署名メッセージ（BIP-322）を検証する',
    },
  },
  Counterparty: {
    icon: null,
    what: {
      en: 'Protocol for tokens and assets on Bitcoin',
      ja: 'ビットコイン上のトークンとアセットのプロトコル',
    },
  },
  Alkanes: {
    icon: null,
    what: {
      en: 'Smart-contract protocol on Bitcoin',
      ja: 'ビットコイン上のスマートコントラクトのプロトコル',
    },
  },
  kuromoji: {
    icon: null,
    what: { en: 'Splits Japanese text into words', ja: '日本語の文章を単語に分ける形態素解析器' },
  },
  Rapier: {
    icon: null,
    what: { en: 'Physics engine for games', ja: 'ゲーム向けの物理エンジン' },
  },
  Colyseus: {
    icon: null,
    what: { en: 'Multiplayer game server', ja: 'マルチプレイヤーゲームのサーバー' },
  },
};

/** A technology's logo, if there is one. */
export const techIcon = (name: string) => catalogue[name]?.icon ?? null;
/** One line on what a technology is, in the page's language. */
export const techWhat = (name: string, locale: Locale) => catalogue[name]?.what[locale] ?? null;
/** Up to two letters standing in for a missing logo: "Counterparty" → "Co", "bip322-js" → "bi". */
export const techInitials = (name: string) => name.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2);
