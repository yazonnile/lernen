/* eslint @typescript-eslint/no-var-requires: 0 */
/* global require __dirname module */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = ({ isProduction }) => {
  return {
    mode: isProduction ? 'production' : 'development',

    entry: {
      index: './src/index.ts'
    },

    output: {
      path: path.join(__dirname + './../server/src/public'),
      filename: '[name].js',
      chunkFilename: '[name].js?id=[chunkhash]'
    },

    module: {
      rules: [{
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            dev: !isProduction,
            preprocess: require('svelte-preprocess')({
              postcss: true
            })
          }
        }
      }, {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }, {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }, {
        test: /icon\/.+\.svg$/,
        exclude: /node_modules/,
        use: 'svg-inline-loader'
      }, {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }]
    },

    resolve: {
      alias: {
        svelte: path.resolve('node_modules', 'svelte'),
        sdk: path.resolve(__dirname, './src/sdk'),
        stores: path.resolve(__dirname, './src/stores'),
        lib: path.resolve(__dirname, './src/lib'),
        api: path.resolve(__dirname, './src/api'),
        routes: path.resolve(__dirname, './src/routes'),
        src: path.resolve(__dirname, './src'),
      },
      extensions: ['.ts', '.mjs', '.js', '.svelte'],
      mainFields: ['svelte', 'browser', 'module', 'main']
    },

    devtool: isProduction ? false : 'source-map',

    devServer: {
      contentBase: './public',
      historyApiFallback: true,
      host: 'localhost',
      hot: false,
      noInfo: true,
      open: true,
      port: '8040',
      progress: true,
      stats: {
        all: false,
        warnings: true,
        errors: true
      }
    },

    plugins: [
      new CopyPlugin([
        './src/index.html',
        './src/static'
      ]),
      new MiniCssExtractPlugin({ ignoreOrder: true }),
      new webpack.DefinePlugin({
        'PRODUCTION': isProduction
      }),

      ...(isProduction ? [
        new CleanWebpackPlugin(),
        new webpack.AutomaticPrefetchPlugin()
      ] : [])
    ],

    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
  }
};
