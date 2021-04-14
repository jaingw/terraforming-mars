'use strict';
// const path = require('path');
const process = require('process');
// const CompressionPlugin = require('compression-webpack-plugin');
// const zlib = require("zlib");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const tmpVersion = new Date().toISOString().substr(5, 5).replace('-', '') + (Math.floor(Math.random() * 1e4)).toString();
const VERSION = tmpVersion;

module.exports = {
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: [
    './build/src/script.js',
  ],
  // plugins: [new CompressionPlugin()],
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoEmitOnErrorsPlugin(),
    // new ReloadPlugin(),
    new HtmlWebpackPlugin({
      title: 'Foo',
      filename: 'assets/index_ca.html',
      template: 'assets/index.html',
      inject: true,
      minify: false,
      chunks: 'all',
      excludeChunks: ['main'], // 排除名為 main 的 chunk
      chunksSortMode: 'auto',
    }),
    new HtmlReplaceWebpackPlugin({
      pattern: 'VERSION',
      replacement: VERSION,
    }),
  ],
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
