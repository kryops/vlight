import compression from 'compression'
import express from 'express'
import { join } from 'path'
import sourceMapSupport from 'source-map-support'

import { logInfo } from './util/log'

sourceMapSupport.install()

const port = 8000
const isDevelopment = process.env.NODE_ENV === 'development'

logInfo('development', isDevelopment)

const app = express()

if (isDevelopment) {
  import('./development').then(dev => dev.applyDevMiddleware(app))
} else {
  app.use(compression())
  app.use(express.static(join(__dirname, '../../frontend/dist')))
}

app.listen(port, () => logInfo(`vLight listening on http://127.0.0.1:${port}`))
