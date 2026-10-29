export const siteOrigin = 'https://beyondblockchain.com';
export const pageMetadata = {
  '/': {
    title: 'Beyond Blockchain — A one-person development studio',
    description:
      'Blockchain, AI and useful software by Quentin de Beauchesne (ffmad): Ikitai, Fairmints and FestCompass.',
    image: '/social/projects.png',
    imageAlt:
      'Beyond Blockchain. Founder and developer Quentin de Beauchesne, with Ikitai, Fairmints, and FestCompass.',
  },
  '/quentin': {
    title: 'Quentin de Beauchesne (ffmad)',
    description:
      'Hi, I’m Quentin, online ffmad. I started CryptoFR in 2014, co-founded Ownest in 2017, and now build Ikitai, Fairmints and FestCompass.',
    image: '/social/quentin.png',
    imageAlt: 'Quentin de Beauchesne, founder and developer, also known as ffmad.',
  },
};

export function metadataFor(path) {
  return (
    pageMetadata[path.replace(/\/$/, '') || '/'] ?? {
      title: 'Page not found — Beyond Blockchain',
      description: 'Find your way back to the projects and people behind Beyond Blockchain.',
      image: '/social/projects.png',
      imageAlt: 'Beyond Blockchain — projects by Quentin de Beauchesne.',
    }
  );
}

export function metadataTags(path) {
  path = path.replace(/\/$/, '') || '/';
  const meta = metadataFor(path);
  const canonical = siteOrigin + path;
  const escape = (value) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  return `<title>${escape(meta.title)}</title>
    <meta name="description" content="${escape(meta.description)}">
    <meta name="robots" content="${pageMetadata[path] ? 'index,follow' : 'noindex,follow'}">
    <link rel="canonical" href="${escape(canonical)}">
    <meta property="og:type" content="${path === '/quentin' ? 'profile' : 'website'}">
    <meta property="og:site_name" content="Beyond Blockchain">
    <meta property="og:title" content="${escape(meta.title)}">
    <meta property="og:description" content="${escape(meta.description)}">
    <meta property="og:url" content="${escape(canonical)}">
    <meta property="og:image" content="${siteOrigin}${meta.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:alt" content="${escape(meta.imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${siteOrigin}${meta.image}">
    <meta name="twitter:image:alt" content="${escape(meta.imageAlt)}">
    <meta name="twitter:title" content="${escape(meta.title)}">
    <meta name="twitter:description" content="${escape(meta.description)}">`;
}
