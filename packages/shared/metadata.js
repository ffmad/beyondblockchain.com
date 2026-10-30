export const siteOrigin = 'https://beyondblockchain.com';

// English lives at the root and Japanese under /ja. Inside the app every path is the English one (/, /quentin,
// /work/<slug>); the router's base adds the language prefix.
export const locales = ['en', 'ja'];
export const defaultLocale = 'en';
const ogLocales = { en: 'en_US', ja: 'ja_JP' };

/** The language of a full address path. */
export function localeFromPath(path) {
  return /^\/ja(?:\/|$)/.test(path) ? 'ja' : 'en';
}
/** A full address path without its language prefix. */
export function stripLocale(path) {
  return path.replace(/^\/ja(?=\/|$)/, '') || '/';
}
/** The full address path of an app path in a language. */
export function localizedPath(path, locale) {
  if (locale !== 'ja') return path;
  return path === '/' ? '/ja/' : `/ja${path}`;
}
/** The API address of some content in a language. */
export function contentPath(path, locale) {
  return locale === 'ja' ? `${path}?lang=ja` : path;
}

export const pageMetadata = {
  en: {
    '/': {
      title: 'Beyond Blockchain — Quentin de Beauchesne',
      description:
        'Quentin de Beauchesne (ffmad) has built on blockchain since 2014 and now builds beyond it with AI: Ikitai, Fairmints, FestCompass and TapLog.',
      image: '/social/home.en.png',
      imageAlt:
        'Beyond Blockchain. Pioneer in blockchain development since 2014, building beyond it with AI: Ikitai, Fairmints, FestCompass and TapLog.',
    },
    '/quentin': {
      title: 'Quentin de Beauchesne (ffmad)',
      description:
        'Hi, I’m Quentin, online ffmad. I started CryptoFR in 2014, co-founded Ownest in 2017, and now build Ikitai, Fairmints, FestCompass and TapLog.',
      image: '/social/quentin.en.png',
      imageAlt:
        'Quentin de Beauchesne, founder and product engineer in Tokyo, also known as ffmad, now building Ikitai, Fairmints, FestCompass and TapLog.',
    },
  },
  ja: {
    '/': {
      title: 'Beyond Blockchain — Quentin de Beauchesne',
      description:
        'Quentin de Beauchesne（ffmad）は2014年からブロックチェーン開発に取り組み、いまはAIでその先をつくっています。Ikitai、Fairmints、FestCompass、TapLog。',
      image: '/social/home.ja.png',
      imageAlt:
        'Beyond Blockchain。2014年からブロックチェーン開発の先駆者として、いまはAIでその先をつくる。Ikitai、Fairmints、FestCompass、TapLog。',
    },
    '/quentin': {
      title: 'Quentin de Beauchesne（ffmad）',
      description:
        'こんにちは、Quentinです。ネットではffmadとして活動しています。2014年にCryptoFRを立ち上げ、2017年にOwnestを共同創業。いまはIkitai、Fairmints、FestCompass、TapLogをつくっています。',
      image: '/social/quentin.ja.png',
      imageAlt:
        '東京の創業者・プロダクトエンジニア、Quentin de Beauchesne（ffmad）。いまはIkitai、Fairmints、FestCompass、TapLogをつくっています。',
    },
  },
};

const projectText = {
  en: (project) => ({
    title: `${project.name} — Beyond Blockchain`,
    imageAlt: `${project.name}: ${project.summary} A project by Quentin de Beauchesne, with its real screen.`,
  }),
  ja: (project) => ({
    title: `${project.name} — Beyond Blockchain`,
    imageAlt: `${project.name}：${project.summary} Quentin de Beauchesneのプロジェクトと、その実際の画面。`,
  }),
};
const notFound = {
  en: {
    title: 'Page not found — Beyond Blockchain',
    description: 'Find your way back to the projects and people behind Beyond Blockchain.',
    imageAlt: 'Beyond Blockchain — projects by Quentin de Beauchesne.',
  },
  ja: {
    title: 'ページが見つかりません — Beyond Blockchain',
    description: 'Beyond Blockchainのプロジェクトと、それをつくる人のページへ戻れます。',
    imageAlt: 'Beyond Blockchain — Quentin de Beauchesneのプロジェクト。',
  },
};

/** The project slug in a /work/<slug> path, or null. */
export function workSlug(path) {
  return path.match(/^\/work\/([\w-]+)\/?$/)?.[1] ?? null;
}

// Project pages take their title and description from the project itself; unknown pages are not indexed.
export function metadataFor(path, projects, locale = defaultLocale) {
  path = path.replace(/\/$/, '') || '/';
  const pages = pageMetadata[locale] ?? pageMetadata.en;
  if (pages[path]) return { ...pages[path], indexed: true };
  const slug = workSlug(path);
  // Only products have a page of their own.
  const project =
    slug && projects?.find((p) => p.slug === slug && (p.kind ?? 'product') === 'product');
  if (project)
    return {
      ...(projectText[locale] ?? projectText.en)(project),
      description: `${project.summary} ${project.description}`,
      // Rendered by tools/share-cards.mjs for every product and language.
      image: `/social/work-${project.slug}.${locale}.png`,
      indexed: true,
    };
  return {
    ...(notFound[locale] ?? notFound.en),
    image: `/social/home.${locale}.png`,
    indexed: false,
  };
}

/** Absolute addresses of a page: its canonical one and one per language. */
export function pageUrls(path, locale = defaultLocale) {
  path = path.replace(/\/$/, '') || '/';
  const url = (language) => siteOrigin + localizedPath(path, language);
  return {
    canonical: url(locale),
    alternates: Object.fromEntries(locales.map((language) => [language, url(language)])),
  };
}

const socials = [
  'https://github.com/ffmad',
  'https://www.linkedin.com/in/qdebeauchesne/',
  'https://x.com/quentinbdb',
];
const jobTitles = { en: 'Founder and product engineer', ja: '創業者・プロダクトエンジニア' };
const platformNames = { web: 'Web', ios: 'iOS', android: 'Android' };

/** schema.org data for search engines and AI assistants: the person, the site and the products. */
export function structuredData(path, projects, locale = defaultLocale) {
  path = path.replace(/\/$/, '') || '/';
  if (!metadataFor(path, projects, locale).indexed) return '';
  const url = (appPath) => siteOrigin + localizedPath(appPath, locale);
  // The person and the site are the same entities in every language, so they keep one address each.
  const person = {
    '@type': 'Person',
    '@id': `${siteOrigin}/#quentin`,
    name: 'Quentin de Beauchesne',
    alternateName: 'ffmad',
    url: `${siteOrigin}/quentin`,
    jobTitle: jobTitles[locale] ?? jobTitles.en,
    address: { '@type': 'PostalAddress', addressLocality: 'Tokyo', addressCountry: 'JP' },
    sameAs: socials,
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${siteOrigin}/#website`,
    name: 'Beyond Blockchain',
    url: `${siteOrigin}/`,
    inLanguage: locales,
    publisher: { '@id': person['@id'] },
  };
  const products = (projects ?? []).filter((p) => (p.kind ?? 'product') === 'product');
  const application = (project) => ({
    '@type': 'SoftwareApplication',
    '@id': `${siteOrigin}/work/${project.slug}#app`,
    name: project.name,
    description: `${project.summary} ${project.description}`,
    url: project.url,
    mainEntityOfPage: url(`/work/${project.slug}`),
    ...(project.platforms?.length && {
      operatingSystem: project.platforms.map((p) => platformNames[p] ?? p).join(', '),
    }),
    ...(project.languages?.length && { inLanguage: project.languages }),
    author: { '@id': person['@id'] },
  });
  const slug = workSlug(path);
  const graph =
    path === '/quentin'
      ? [
          website,
          { '@type': 'ProfilePage', url: url('/quentin'), inLanguage: locale, mainEntity: person },
        ]
      : slug
        ? [website, person, ...products.filter((p) => p.slug === slug).map(application)]
        : [
            website,
            person,
            {
              '@type': 'ItemList',
              itemListElement: products.map((project, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: application(project),
              })),
            },
          ];
  // Escaping '<' keeps content from closing the script element.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  return `<script type="application/ld+json">${json.replaceAll('<', '\\u003c')}</script>`;
}

/**
 * `imageExists` lets the server check that a preview image was rendered; without one the page uses the studio
 * page's image.
 */
export function metadataTags(path, projects, locale = defaultLocale, imageExists) {
  path = path.replace(/\/$/, '') || '/';
  const meta = metadataFor(path, projects, locale);
  if (imageExists && !imageExists(meta.image)) {
    meta.image = `/social/home.${locale}.png`;
    meta.imageAlt = (pageMetadata[locale] ?? pageMetadata.en)['/'].imageAlt;
  }
  const { canonical, alternates } = pageUrls(path, locale);
  const escape = (value) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  const languages = meta.indexed
    ? locales
        .map(
          (language) =>
            `<link rel="alternate" hreflang="${language}" href="${escape(alternates[language])}">`,
        )
        .concat(
          `<link rel="alternate" hreflang="x-default" href="${escape(alternates[defaultLocale])}">`,
        )
        .join('\n    ')
    : '';
  // A missing page has no canonical address: it is not a page search engines should keep.
  return `<title>${escape(meta.title)}</title>
    <meta name="description" content="${escape(meta.description)}">
    <meta name="robots" content="${meta.indexed ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">
    ${meta.indexed ? `<link rel="canonical" href="${escape(canonical)}">` : ''}
    ${languages}
    <meta property="og:type" content="${path === '/quentin' ? 'profile' : 'website'}">
    <meta property="og:site_name" content="Beyond Blockchain">
    <meta property="og:locale" content="${ogLocales[locale] ?? ogLocales.en}">
    ${locales
      .filter((language) => language !== locale)
      .map((language) => `<meta property="og:locale:alternate" content="${ogLocales[language]}">`)
      .join('\n    ')}
    <meta property="og:title" content="${escape(meta.title)}">
    <meta property="og:description" content="${escape(meta.description)}">
    <meta property="og:url" content="${escape(canonical)}">
    <meta property="og:image" content="${siteOrigin}${meta.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:alt" content="${escape(meta.imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:creator" content="@quentinbdb">
    <meta name="twitter:image" content="${siteOrigin}${meta.image}">
    <meta name="twitter:image:alt" content="${escape(meta.imageAlt)}">
    <meta name="twitter:title" content="${escape(meta.title)}">
    <meta name="twitter:description" content="${escape(meta.description)}">
    ${structuredData(path, projects, locale)}`;
}
