import compression from 'compression'
import express from 'express'
import { join } from 'path'

import { httpPort, isDevelopment } from './config'
import { logInfo } from './util/log'

export function initExpressApp() {
  const app = express()

  if (isDevelopment) {
    import('./development').then(dev => dev.applyDevMiddleware(app))
  } else {
    app.use(compression())
    app.use(express.static(join(__dirname, '../../frontend/dist')))
  }

  app.listen(httpPort, () =>
    logInfo(`vLight started on http://127.0.0.1:${httpPort}`)
  )
}
