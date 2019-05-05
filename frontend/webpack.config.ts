// import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin'
import { join } from 'path'

import ForkCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractCssPlugin from 'mini-css-extract-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
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

// linaria CSS options
stylis.set({ prefix: false })

export const webpackConfiguration = (env: Env = {}) => {
  const isProduction = !!env.production
  const analyze = !!env.analyze
  const profile = !!env.profile
  const isDevServer = process.env.DEV_SERVER === 'true'

  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = isProduction ? 'production' : 'development'
  }

  const configuration: Configuration = {
    entry: [
      isProduction && join(__dirname, 'src/polyfills.ts'),
      join(__dirname, 'src/index.tsx'),
      !isProduction &&
        isDevServer &&
        'webpack-hot-middleware/client?reload=true',
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
          test: /\.jsx?$/,
          include: /node_modules/,
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
            {
              loader: ExtractCssPlugin.loader,
              options: {
                hmr: true,
                reloadAll: true,
              },
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
      alias: {
        'core-js': 'core-js3',
      },
    },
    stats: profile ? 'normal' : 'minimal',
    performance: false,
    devServer: {
      publicPath: '/',
      hot: true,
      stats: 'minimal',
      port: 8001,
      open: true,
      clientLogLevel: 'error',
      disableHostCheck: true,
      historyApiFallback: true,
      overlay: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000/',
        },
        '/ws': {
          target: 'ws://localhost:8000/',
          ws: true,
        },
      },
    },
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
    const smp = new SpeedMeasurePlugin()
    return smp.wrap(configuration)
  }

  return configuration
}

export default webpackConfiguration
