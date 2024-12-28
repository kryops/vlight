// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/webpack-dev-server/types/lib/Server.d.ts"/>

// eslint-disable-next-line import/no-nodejs-modules
import { join } from 'path'

import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractCssPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import type { JsMinifyOptions as SwcOptions } from '@swc/core'
import {
  Configuration,
  DefinePlugin,
  HotModuleReplacementPlugin,
  WebpackPluginInstance,
} from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'

interface Env {
  analyze?: any
  production?: any
  profile?: any
  profileReact?: any
}

export const webpackConfiguration = (env: Env = {}): Configuration => {
  const isProduction = !!env.production || !!env.profileReact
  const analyze = !!env.analyze
  const profile = !!env.profile
  const profileReact = !!env.profileReact

  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = isProduction ? 'production' : 'development'
  }

  const configuration: Configuration = {
    entry: [
      isProduction && join(__dirname, 'src/polyfills.ts'),
      join(__dirname, 'src/index.tsx'),
    ].filter(Boolean) as [string, ...string[]],
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    // https://github.com/webpack/webpack-dev-server/issues/2758
    // https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/235
    target: isProduction ? 'browserslist' : 'web',
    output: {
      path: join(__dirname, 'dist'),
      publicPath: '/',
      globalObject: 'this', // support web workers
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                plugins: [
                  // needs to be put here instead of the global Babel config
                  // https://github.com/callstack/linaria/issues/1063
                  !isProduction && [
                    'react-refresh/babel',
                    {
                      skipEnvCheck: true,
                    },
                  ],
                ].filter(Boolean),
              },
            },
            {
              loader: '@linaria/webpack-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
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
      alias: {
        // transpile from sources in frontend build
        '@vlight/controls': join(__dirname, '../shared/controls/src'),
        '@vlight/utils': join(__dirname, '../shared/utils/src'),
        ...(profileReact
          ? {
              'react-dom$': 'react-dom/profiling',
              'scheduler/tracing': 'scheduler/tracing-profiling',
            }
          : {}),
      },
    },
    stats: profile ? 'normal' : 'minimal',
    performance: false,
    devServer: {
      devMiddleware: {
        publicPath: '/',
      },
      client: {
        logging: 'error',
      },
      port: 8001,
      open: true,
      allowedHosts: 'all',
      historyApiFallback: true,
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:8000/',
        },
        {
          context: ['/websocket'],
          target: 'ws://localhost:8000/',
          ws: true,
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        ),
        // needed for emittery dependency
        'process.env.DEBUG': JSON.stringify(false),
      }),
      new HtmlWebpackPlugin({
        template: join(__dirname, 'index.html'),
      }),
      new ExtractCssPlugin({
        ignoreOrder: true,
      }),

      // development
      !isProduction && new HotModuleReplacementPlugin(),
      !isProduction && new ReactRefreshPlugin(),

      // analyze
      analyze && new BundleAnalyzerPlugin(),
    ].filter(Boolean) as WebpackPluginInstance[],

    optimization: {
      minimizer: [
        new TerserPlugin<SwcOptions>({
          minify: TerserPlugin.swcMinify,
          parallel: true,
          terserOptions: {
            mangle: true,
            ...(profileReact
              ? {
                  keep_classnames: true,
                  keep_fnames: true,
                }
              : {}),
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 1000,
        maxAsyncRequests: 10,
        cacheGroups: {
          defaultVendors: false,
          styles: {
            name: 'styles',
            type: 'css/mini-extract',
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },

    // disable for now as it might be responsible for CSS problems

    // cache:
    //   profile || profileReact
    //     ? undefined
    //     : {
    //         type: 'filesystem',
    //         name: isProduction ? 'production' : 'development',
    //         buildDependencies: {
    //           config: [__filename, join(__dirname, '../yarn.lock')],
    //         },
    //       },
  }

  if (profile) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
    const smp = new SpeedMeasurePlugin()
    return smp.wrap(configuration)
  }

  return configuration
}

export default webpackConfiguration
