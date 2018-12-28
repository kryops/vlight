import compression from 'compression'
import express from 'express'
import { join } from 'path'

import { httpPort, isDevelopment } from './config'

export async function initExpressApp() {
  const app = express()

  if (isDevelopment) {
    import('./development').then(dev => dev.applyDevMiddleware(app))
  } else {
    app.use(compression())
    app.use(express.static(join(__dirname, '../../frontend/dist')))
  }

  await new Promise(resolve => app.listen(httpPort, () => resolve()))
}
