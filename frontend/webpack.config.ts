import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin'
import ForkCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
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
}

// sass-loader workaround
process.env.UV_THREADPOOL_SIZE = '20'

// linaria CSS options
stylis.set({ prefix: false })

export const webpackConfiguration = (env: Env = {}) => {
  const isProduction = !!env.production
  const analyze = !!env.analyze

  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = isProduction ? 'production' : 'development'
  }

  const configuration: Configuration = {
    entry: [
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
            {
              loader: 'linaria/loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            ExtractCssPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: true,
                localIdentName: '[name]_[local]-[hash:base64:5]',
              },
            },
            {
              loader: 'resolve-url-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            !isProduction && 'css-hot-loader',
            ExtractCssPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: false,
              },
            },
          ].filter(Boolean),
        },
      ].filter(Boolean),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'],
    },
    stats: 'minimal',
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
      new ExtractCssPlugin({
        cssModules: true,
        hot: !isProduction,
      }),
      new WebpackPwaManifest({
        name: 'vLight',
        description: 'Virtual Light Controller',
        display: 'standalone',
        background_color: '#000c15',
        ios: true,
      }),

      // development
      !isProduction && new HotModuleReplacementPlugin(),
      !isProduction &&
        new ForkCheckerPlugin({
          tsconfig: join(__dirname, 'tsconfig.json'),
        }),

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
  return configuration
}

export default webpackConfiguration
