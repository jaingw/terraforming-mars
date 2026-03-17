/** @type {import('tailwindcss').Config} */
module.exports = {
  // prefix: 'tw-',
  important: true,
  content: [
    './assets/index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mars: {
          void: '#0a0e1a',
          deep: '#111a2e',
          surface: '#1a2540',
          border: '#263050',
          rust: '#e2520e',
          amber: '#f59e0b',
          ember: '#f97316',
          sand: '#c48b5c',
          cyan: '#22d3ee',
          teal: '#2dd4bf',
          red: '#ef4444',
          yellow: '#facc15',
          text: '#f1f5f9',
          'text-dim': '#cbd5e1',
          'text-faint': '#94a3b8',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 如果存在样式冲突选择原来自带的样式
  },
};

