const webpack = require('webpack');

// Makes the .vue file format parseable.
const {VueLoaderPlugin} = require('vue-loader');
// Compresses resources for smaller download.
const path = require('path');
// Speeds up typescript type checking into a separate process.
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const CompressionPlugin = require('compression-webpack-plugin');
// Enables the tsconfig-paths behavior in webpack. tsconfig-paths is responsible for the
// import mapping that often begins with @.
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// const zlib = require('zlib');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const tmpVersion = new Date().toISOString().substr(5, 5).replace('-', '') + (Math.floor(Math.random() * 1e4)).toString();
const VERSION = tmpVersion;

const plugins = [
  new ForkTsCheckerWebpackPlugin({
    typescript: {
      configOverwrite: {
        exclude: [
          'tests/**/*.ts',
        ],
      },
      extensions: {
        vue: true,
      },
    },
  }),
  new VueLoaderPlugin(),
  // fork 一个进程进行检查
  // new ForkTsCheckerWebpackPlugin({
  //   // async 为 false，同步的将错误信息反馈给 webpack，如果报错了，webpack 就会编译失败
  //   // async 默认为 true，异步的将错误信息反馈给 webpack，如果报错了，不影响 webpack 的编译
  //   async: false,
  //   // eslint: false,
  // }),
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
  new NodePolyfillPlugin(),
];

if (process.env.NODE_ENV === 'development') {
  // Reports progress on the commandline during compilation.
  plugins.push(new webpack.ProgressPlugin());
}

module.exports = {
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/client/main.ts',
  resolve: {
    plugins: [new TsconfigPathsPlugin({
      configFile: 'tsconfig.json',
    })],
    extensions: ['.ts', '.vue', '.js'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/,
        include: path.join(__dirname, 'src/client/'),
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {appendTsSuffixTo: [/\.vue$/], happyPackMode: true, transpileOnly: true},
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader?url=false'],
      },
      {
        test: /\.less$/,
        use: ['vue-style-loader', 'css-loader?url=false', 'less-loader'],
      },
    ],
  },
  plugins,

  output: {
    path: __dirname + '/build',
    hashFunction: 'xxhash64',
  },
  stats: {
    warnings: true,
    colors: true,
    version: true,
    hash: true,
    timings: true,
    chunks: true,
    chunkModules: true,
  },
};
