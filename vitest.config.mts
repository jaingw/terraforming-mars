import {defineConfig} from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls: false,
      },
    }),
  ],

  resolve: {
    alias: [
      {find: '@', replacement: path.resolve(__dirname, 'src')},
      {find: 'assets', replacement: path.resolve(__dirname, 'assets')},
      // Some legacy TS components still use inline `template: ...` strings,
      // so the client build needs the runtime compiler-enabled Vue entry.
      {find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js'},
    ],
    extensions: ['.ts', '.vue', '.js', '.json'],
  },

  test: {
    // Use jsdom environment for DOM simulation (replaces manual jsdom setup)
    environment: 'jsdom',

    // Make describe/it/expect available globally (compatible with existing Mocha-style tests)
    globals: true,

    // Test file patterns
    include: ['tests/client/**/*.spec.ts'],

    setupFiles: ['./tests/client/components/setup.ts'],

    // Timeout for slow tests (e.g., Card_HTML)
    testTimeout: 60000,

    // Don't fail on empty test files (e.g., Card_HTML.spec.ts is fully commented out)
    passWithNoTests: true,
  },
});
