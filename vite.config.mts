/*
 * @Author: Ender Wiggin
 * @Date: 2026-02-11 01:00:18
 * @LastEditors: Ender Wiggin
 * @LastEditTime: 2026-02-12 00:55:26
 * @Description:
 */
import {defineConfig, loadEnv} from 'vite';
import type {Plugin} from 'vite';
import vue from '@vitejs/plugin-vue';
import {createHtmlPlugin} from 'vite-plugin-html';
import * as path from 'path';

const VERSION = new Date().toISOString().substr(5, 5).replace('-', '') +
  (Math.floor(Math.random() * 1e4)).toString();

// Custom onwarn handler to ignore warnings from third-party packages (e.g., mathjs used by ts-trueskill)
function onCustomWarn(warning: any) {
  if (warning.code === 'MODULE_LEAKS' && warning.message.includes('/* #__PURE__ */')) {
    return;
  }
}

function cacheBustMainScript(version: string): Plugin {
  return {
    name: 'cache-bust-main-script',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const indexHtml = bundle['index.html'];
      if (indexHtml?.type !== 'asset' || typeof indexHtml.source !== 'string') {
        return;
      }
      indexHtml.source = indexHtml.source
        .replace(/\s+crossorigin/g, '')
        .replace(/src="\/main\.js"/g, `src="/main.js?v=${version}"`);
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL ||
    `http://${env.VITE_BACKEND_HOST || 'localhost'}:${env.VITE_BACKEND_PORT || env.PORT || '8081'}`;

  return {
    plugins: [
      vue({
        // Don't transform asset URLs in templates — they're runtime paths served by Node backend
        template: {
          transformAssetUrls: false,
        },
      }),
      createHtmlPlugin({
        minify: false,
        inject: {
          data: {
            VERSION,
          },
        },
      }),
      cacheBustMainScript(VERSION),
    ],

    resolve: {
      alias: [
        {find: '@', replacement: path.resolve(__dirname, 'src')},
      ],
      extensions: ['.ts', '.vue', '.js', '.json'],
    },

    // No publicDir — Node server handles static assets; in dev we proxy
    publicDir: false,

    css: {
      preprocessorOptions: {
        less: {
          rewriteUrls: false,
          // Support @import (inline) used in common.less
          math: 'always',
          // Suppress warnings about complex selectors in :extend()
          silenceDeprecations: true,
        },
      },
    },

    define: {
      // Inject version string so it can be used at runtime if needed
      '__APP_VERSION__': JSON.stringify(VERSION),
    },

    build: {
      outDir: 'build',
      emptyOutDir: false,
      cssCodeSplit: false,
      modulePreload: false,
      sourcemap: mode !== 'production',

      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        onwarn: onCustomWarn,
        output: {
          entryFileNames: 'main.js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames(assetInfo) {
            if (assetInfo.name?.endsWith('.css')) {
              return '[name]-[hash][extname]';
            }
            return 'css/[name]-[hash][extname]';
          },
          hoistTransitiveImports: false,
          manualChunks(id) {
            // Keep dependency code and Rollup's CommonJS helpers together.
            // Some dependencies such as axios need the helper module even though
            // Rollup marks it as a virtual, non-node_modules id.
            if (id.includes('node_modules') || id.includes('commonjsHelpers.js')) {
              return 'vendor';
            }
            // 所有源码 chunk 合并到 app.js
            return 'app';
          },
        },
      },
    },

    server: {
      host: '0.0.0.0', // 监听所有网络接口
      port: 5173,
      proxy: {
        // Only proxy API endpoints and static assets to backend.
        // All client-side page routes (/, /login, /player, /lobby, etc.)
        // are handled by Vite's SPA fallback (serves index.html).
        '/api': backendTarget,
        '/favicon.ico': backendTarget,
        // Static assets built by server (CSS, fonts, images, locales)
        '/styles.css': backendTarget,
        '/tailwindcss.css': backendTarget,
        '/assets': backendTarget,
        // Server-side API endpoints (not /api/*) that need to be proxied
        '/player/input': backendTarget,
        '/autopass': backendTarget,
      },
    },
  };
});
