import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin'
import ForkCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { join } from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import {
  Configuration,
  DefinePlugin,
  HotModuleReplacementPlugin,
  Plugin,
} from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

interface Env {
  analyze?: any
  production?: any
}

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
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
        {
          test: /\.s?css$/,
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
      ],
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
    },
  }
  return configuration
}

export default webpackConfiguration
