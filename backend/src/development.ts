import { Express } from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

export const applyDevMiddleware = (app: Express) => {
  // we use require() so it doesn't get compiled for the production build
  const webpackConfiguration = require('../../frontend/webpack.config').webpackConfiguration(
    {
      production: false,
    }
  )
  const webpackCompiler = webpack(webpackConfiguration)

  app.use(
    webpackDevMiddleware(webpackCompiler, {
      publicPath: webpackConfiguration.output!.publicPath!,
      serverSideRender: false,
      stats: 'minimal',
    })
  )

  app.use(webpackHotMiddleware(webpackCompiler))
}
