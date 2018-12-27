import ForkCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { join } from 'path'
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

  const configuration: Configuration = {
    entry: [
      join(__dirname, 'src/index.tsx'),
      !isProduction && 'webpack-hot-middleware/client',
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

      // development
      !isProduction && new HotModuleReplacementPlugin(),
      !isProduction &&
        new ForkCheckerPlugin({
          tsconfig: join(__dirname, 'tsconfig.json'),
        }),

      // analyze
      analyze && new BundleAnalyzerPlugin(),
    ].filter(Boolean) as Plugin[],
  }
  return configuration
}

export default webpackConfiguration
