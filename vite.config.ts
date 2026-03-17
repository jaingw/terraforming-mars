/*
 * @Author: Ender Wiggin
 * @Date: 2026-02-11 01:00:18
 * @LastEditors: Ender Wiggin
 * @LastEditTime: 2026-02-12 00:55:26
 * @Description:
 */
import {defineConfig} from 'vite';
import vue2 from '@vitejs/plugin-vue2';
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

export default defineConfig({
  plugins: [
    vue2({
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
  ],

  resolve: {
    alias: {
      // @/* path alias (mirrors tsconfig paths)
      '@': path.resolve(__dirname, 'src'),
      // Vue 2.7 still needs a full ESM build for runtime template compilation
      'vue': 'vue/dist/vue.esm.js',
    },
    extensions: ['.ts', '.vue', '.js', '.json'],
  },

  // No publicDir — Node server handles static assets; in dev we proxy
  publicDir: false,

  css: {
    preprocessorOptions: {
      less: {
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
    emptyOutDir: false, // Don't wipe build/ (it also contains server build, styles.css, etc.)
    sourcemap: true,

    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      onwarn: onCustomWarn,
      output: {
        // Match existing convention: build/main.js (no hash)
        entryFileNames: 'main.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'css/[name]-[hash][extname]',
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Only proxy API endpoints and static assets to backend.
      // All client-side page routes (/, /login, /player, /lobby, etc.)
      // are handled by Vite's SPA fallback (serves index.html).
      '/api': 'http://localhost:8081',
      '/favicon.ico': 'http://localhost:8081',
      // Static assets built by server (CSS, fonts, images, locales)
      '/styles.css': 'http://localhost:8081',
      '/tailwindcss.css': 'http://localhost:8081',
      '/assets': 'http://localhost:8081',
      // Server-side API endpoints (not /api/*) that need to be proxied
      '/player/input': 'http://localhost:8081',
      '/reset': 'http://localhost:8081',
      '/autopass': 'http://localhost:8081',
    },
  },
});
