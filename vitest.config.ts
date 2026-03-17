import {defineConfig} from 'vitest/config';
import vue2 from '@vitejs/plugin-vue2';
import * as path from 'path';

export default defineConfig({
  plugins: [
    vue2(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.esm.js',
    },
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
