// import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin'
import ForkCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractCssPlugin from 'mini-css-extract-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { join } from 'path'
import stylis from 'stylis'
import TerserPlugin from 'terser-webpack-plugin'
import {
  Configuration,
  DefinePlugin,
  HotModuleReplacementPlugin,
  Plugin,
} from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import WebpackPwaManifest from 'webpack-pwa-manifest'

interface Env {
  analyze?: any
  production?: any
  profile?: any
}

// sass-loader workaround
process.env.UV_THREADPOOL_SIZE = '20'

// linaria CSS options
stylis.set({ prefix: false })

export const webpackConfiguration = (env: Env = {}) => {
  const isProduction = !!env.production
  const analyze = !!env.analyze
  const profile = !!env.profile

  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = isProduction ? 'production' : 'development'
  }

  const configuration: Configuration = {
    entry: [
      isProduction && join(__dirname, 'src/polyfills.ts'),
      join(__dirname, 'src/index.tsx'),
      !isProduction && 'webpack-hot-middleware/client?reload=true',
    ].filter(Boolean) as string[],
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    target: 'web',
    output: {
      path: join(__dirname, 'dist'),
      publicPath: '/',
    },
    module: {
      rules: [
        (!isProduction && {
          test: /\.js$/,
          include: /node_modules\/react-dom/,
          loader: 'react-hot-loader/webpack',
        }) as any,
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
              },
            },
            'thread-loader',
            {
              // TODO this is pretty slow - can we reduce its impact?
              loader: 'linaria/loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.linaria\.css$/,
          exclude: /node_modules/,
          use: [
            !isProduction && {
              loader: 'css-hot-loader',
              options: {
                cssModule: true, // to reload the JS file as well
                reloadAll: true, // desperate times call for desperate measures
              },
            },
            {
              loader: ExtractCssPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: false,
              },
            },
          ].filter(Boolean),
        },
      ].filter(Boolean) as any,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    stats: profile ? 'normal' : 'minimal',
    performance: false,
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        ),
      }),
      new HtmlWebpackPlugin({
        template: join(__dirname, 'index.html'),
      }),
      new ExtractCssPlugin(),
      new WebpackPwaManifest({
        name: 'vLight',
        description: 'Virtual Light Controller',
        display: 'standalone',
        background_color: '#000c15',
        ios: true,
      }),
      !profile &&
        new ForkCheckerPlugin({
          tsconfig: join(__dirname, 'tsconfig.json'),
        }),

      // development
      !isProduction && new HotModuleReplacementPlugin(),

      // production
      isProduction &&
        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true,
            },
          },
        }),

      // analyze
      analyze && new BundleAnalyzerPlugin(),
    ].filter(Boolean) as Plugin[],

    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          terserOptions: {
            mangle: true,
            ie8: false,
            sourceMap: true,
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: false,
        },
      },
    },
  }

  if (profile) {
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
    const smp = new SpeedMeasurePlugin()
    return smp.wrap(configuration)
  }

  return configuration
}

export default webpackConfiguration
