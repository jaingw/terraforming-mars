/** @type {import('tailwindcss').Config} */
module.exports = {
  // prefix: 'tw-',
  important: true,
  content: [
    './assets/index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 如果存在样式冲突选择原来自带的样式
  },
};

