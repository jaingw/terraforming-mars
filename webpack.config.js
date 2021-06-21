// const path = require('path');
const {VueLoaderPlugin} = require('vue-loader');
// const CompressionPlugin = require('compression-webpack-plugin');
// const zlib = require("zlib");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const tmpVersion = new Date().toISOString().substr(5, 5).replace('-', '') + (Math.floor(Math.random() * 1e4)).toString();
const VERSION = tmpVersion;

module.exports = {
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/main.ts',
  resolve: {
    extensions: ['.ts', '.vue', '.js'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
  },
  module: {
    rules: [
      {test: /\.vue$/, loader: 'vue-loader'},
      {test: /\.tsx?$/, loader: 'ts-loader', options: {appendTsSuffixTo: [/\.vue$/]}},
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
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
  output: {
    path: __dirname + '/build',
  },
};
