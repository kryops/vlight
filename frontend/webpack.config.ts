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
import WorkerPlugin from 'worker-plugin'

interface Env {
  analyze?: any
  production?: any
  profile?: any
  profileReact?: any
}

// linaria CSS options
stylis.set({ prefix: false })

export const webpackConfiguration = (env: Env = {}) => {
  const isProduction = !!env.production || !!env.profileReact
  const analyze = !!env.analyze
  const profile = !!env.profile
  const profileReact = !!env.profileReact
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
              },
            },
            {
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
      alias: isProduction
        ? profileReact
          ? {
              'react-dom$': 'react-dom/profiling',
              'scheduler/tracing': 'scheduler/tracing-profiling',
            }
          : {}
        : {
            'react-dom': '@hot-loader/react-dom',
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
      new ExtractCssPlugin({
        ignoreOrder: true,
      } as any),
      new WebpackPwaManifest({
        name: 'vLight',
        description: 'Virtual Light Controller',
        display: 'standalone',
        background_color: '#000c15',
        ios: true,
      }),
      new WorkerPlugin(),
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
            ...(profileReact
              ? {
                  keep_classnames: true,
                  keep_fnames: true,
                }
              : {}),
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 1000,
        maxAsyncRequests: 10,
        cacheGroups: {
          vendors: false,
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

  if (profile) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
    const smp = new SpeedMeasurePlugin()
    return smp.wrap(configuration)
  }

  return configuration
}

export default webpackConfiguration
