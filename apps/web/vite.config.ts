import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { metadataTags } from '@beyond/shared/metadata.js';

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      {
        name: 'page-metadata',
        transformIndexHtml(html, context) {
          const path = context.originalUrl?.split('?')[0] || '/';
          return html.replace(
            /<!-- page-meta:start -->[\s\S]*?<!-- page-meta:end -->/,
            `<!-- page-meta:start -->${metadataTags(path)}<!-- page-meta:end -->`,
          );
        },
      },
    ],
    build: { copyPublicDir: !isSsrBuild },
    server: {
      port: Number(env.WEB_PORT || 5173),
      strictPort: true,
      proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:3000' } },
    },
  };
});
