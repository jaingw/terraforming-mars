'use strict';

const process = require('process');
// const CompressionPlugin = require('compression-webpack-plugin');
// const zlib = require("zlib");

module.exports = {
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: [
    './build/src/script.js',
  ],
  // plugins: [new CompressionPlugin()],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js', // 'vue/dist/vue.common.js' for webpack 1
    },
  },
  output: {
    path: __dirname + '/build',
  },
  stats: {
    warnings: false,
  },
  watch: process.env.WATCH_IT !== undefined,
};
