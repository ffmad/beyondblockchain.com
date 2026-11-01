import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { localeFromPath, metadataTags, stripLocale } from '@beyond/shared/metadata.js';

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      {
        name: 'page-metadata',
        transformIndexHtml(html, context) {
          const path = context.originalUrl?.split('?')[0] || '/';
          const locale = localeFromPath(path);
          return html
            .replace('<html lang="en">', `<html lang="${locale}">`)
            .replace(
              /<!-- page-meta:start -->[\s\S]*?<!-- page-meta:end -->/,
              `<!-- page-meta:start -->${metadataTags(stripLocale(path), null, locale)}<!-- page-meta:end -->`,
            );
        },
      },
      {
        // The fonts of the first screen start loading with the page instead of after its stylesheet.
        name: 'preload-fonts',
        transformIndexHtml: {
          order: 'post',
          handler(html, { bundle }) {
            if (!bundle) return html;
            const fonts = Object.keys(bundle).filter((file) =>
              /\/(dm-sans-latin-(400|500)-normal|bricolage-grotesque-latin-wdth-normal)-[\w-]+\.woff2$/.test(
                file,
              ),
            );
            return html.replace(
              '</head>',
              fonts
                .map(
                  (file) =>
                    `  <link rel="preload" href="/${file}" as="font" type="font/woff2" crossorigin>\n`,
                )
                .join('') + '  </head>',
            );
          },
        },
      },
    ],
    // vue-i18n: the Composition API only, no devtools in production.
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    build: { copyPublicDir: !isSsrBuild },
    server: {
      port: Number(env.WEB_PORT || 5173),
      strictPort: true,
      proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:3000' } },
    },
  };
});
