import compression from 'compression'
import express from 'express'
import { createServer } from 'http'
import { join } from 'path'

import { handleApiMessage } from './api'
import { httpPort, isDevelopment } from './config'

export const expressApp = express()
export const httpServer = createServer(expressApp)

export async function initExpressApp() {
  expressApp.post('/api', express.json(), (req, res) => {
    if (req.body && req.body.type) {
      handleApiMessage(req.body)
      res.json({ ok: true })
    } else {
      res.json({ ok: false, error: 'Invalid message body' })
    }
  })

  if (isDevelopment) {
    import('./development').then(dev => dev.applyDevMiddleware(expressApp))
  } else {
    expressApp.use(compression())
    expressApp.use(express.static(join(__dirname, '../../frontend/dist')))
  }

  await new Promise(resolve => httpServer.listen(httpPort, () => resolve()))
}
