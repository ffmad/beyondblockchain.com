import type { Locale } from '@beyond/shared/metadata.js';

// The privacy page (/privacy), in both languages. It describes what the code does: the contact form (apps/api/src/
// contact.ts and contact-triage.ts), the assistant (assistant.ts), the browser storage used by the language switch,
// and the server's nginx logs (rotated after 14 days). Change it with them, and move the date when it changes.

export interface PrivacySection {
  heading: string;
  paragraphs: string[];
}
export interface PrivacyPolicy {
  title: string;
  effective: string;
  intro: string;
  /** Who runs the site (運営者情報 for Japanese visitors). */
  operator: { label: string; value: string }[];
  sections: PrivacySection[];
}

export const privacy: Record<Locale, PrivacyPolicy> = {
  en: {
    title: 'Privacy',
    effective: 'Effective 1 November 2026',
    intro:
      'This is the website of Beyond Blockchain, the studio of Quentin de Beauchesne. This page says what the site collects, why, and who else sees it.',
    operator: [
      { label: 'Run by', value: 'Quentin de Beauchesne' },
      { label: 'Based in', value: 'Tokyo, Japan' },
      { label: 'Contact', value: 'The contact form on this site, or LinkedIn' },
    ],
    sections: [
      {
        heading: 'Messages you send',
        paragraphs: [
          'When you write through the contact form, the site keeps your name, email address and message, the page and language you wrote from, and, if you asked the assistant something first, those questions. They are stored on the site’s server and delivered to Quentin’s Slack workspace. Your email address is used only to reply to you.',
          'Before a message reaches Slack, Claude, Anthropic’s AI, may add a short summary and a draft reply for Quentin. It sees your name and message, never your email address. Quentin reads every message and writes every reply himself.',
          'Messages stay in the site’s database so none is lost if Slack is unreachable. Ask, and Quentin deletes yours.',
        ],
      },
      {
        heading: 'The assistant',
        paragraphs: [
          'The site’s assistant answers on the site’s own server, with a small model that matches your question to written facts. Your questions are not stored, unless you then send a message.',
        ],
      },
      {
        heading: 'Your browser',
        paragraphs: [
          'The site uses no cookies, no analytics and no ads. Your browser remembers the language you chose, and briefly keeps the text on screen when you switch language so it can carry it across. Fonts, images and videos all come from this site; other sites are reached only through links you follow.',
        ],
      },
      {
        heading: 'Server logs',
        paragraphs: [
          'Like most web servers, this one logs each request with its IP address, the page and the browser, to keep the site working and safe. The logs are deleted after 14 days. To stop abuse, the contact form and the assistant also count recent requests from each IP address, in memory only, for up to an hour.',
        ],
      },
      {
        heading: 'Where it is kept',
        paragraphs: [
          'The site runs on a server in Germany, at Hetzner. Slack and Anthropic are companies in the United States and handle what they receive under their own privacy policies. Nothing is sold or shared with anyone else.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'To see, correct or delete what you sent, write through the contact form or on LinkedIn. If this page changes, the date above changes too.',
        ],
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー',
    effective: '2026年11月1日施行',
    intro:
      'このサイトは、Quentin de Beauchesneのスタジオ「Beyond Blockchain」のウェブサイトです。このページでは、サイトが集める情報、その目的、ほかに情報を受け取る相手を説明します。',
    operator: [
      { label: '運営者', value: 'Quentin de Beauchesne' },
      { label: '所在地', value: '東京都' },
      { label: 'お問い合わせ', value: 'このサイトのお問い合わせフォーム、またはLinkedIn' },
    ],
    sections: [
      {
        heading: 'お問い合わせの内容',
        paragraphs: [
          'お問い合わせフォームからメッセージを送ると、お名前、メールアドレス、メッセージ、送信したページと言語、そして先にアシスタントに質問していた場合はその質問を保存します。これらはサイトのサーバーに保存され、QuentinのSlackワークスペースに届きます。メールアドレスは返信のためだけに使います。',
          'メッセージがSlackに届く前に、AnthropicのAI「Claude」がQuentin向けに短い要約と返信の下書きを作ることがあります。Claudeが見るのはお名前とメッセージだけで、メールアドレスは渡しません。すべてのメッセージはQuentinが自分で読み、返信も自分で書きます。',
          'Slackに届かなかった場合に失われないよう、メッセージはサイトのデータベースに残ります。ご依頼があれば削除します。',
        ],
      },
      {
        heading: 'アシスタント',
        paragraphs: [
          'サイトのアシスタントは、質問を書かれた事実と照らし合わせる小さなモデルで、サイト自身のサーバー上で答えます。質問は保存しません（そのあとメッセージを送った場合を除きます）。',
        ],
      },
      {
        heading: 'ブラウザに保存されるもの',
        paragraphs: [
          'Cookie、アクセス解析、広告は使っていません。ブラウザには選んだ言語が保存され、言語を切り替えるときだけ、画面の文章を引き継ぐために一時的に保存されます。フォント、画像、動画はすべてこのサイトから配信しています。ほかのサイトにつながるのは、リンクを開いたときだけです。',
        ],
      },
      {
        heading: 'サーバーのログ',
        paragraphs: [
          '多くのウェブサーバーと同じく、サイトを動かし安全に保つため、リクエストごとにIPアドレス、ページ、ブラウザを記録します。ログは14日後に削除されます。また、悪用を防ぐため、お問い合わせフォームとアシスタントはIPアドレスごとの最近のリクエスト数を、メモリ上でのみ最大1時間数えます。',
        ],
      },
      {
        heading: '保存場所',
        paragraphs: [
          'サイトはドイツにあるHetznerのサーバーで動いています。SlackとAnthropicは米国の企業で、受け取った情報をそれぞれのプライバシーポリシーに従って扱います。ほかの誰かに情報を販売したり提供したりすることはありません。',
        ],
      },
      {
        heading: 'ご依頼について',
        paragraphs: [
          '送った内容の確認、訂正、削除は、お問い合わせフォームかLinkedInからご連絡ください。このページを変更した場合は、上の日付も更新します。',
        ],
      },
    ],
  },
};
