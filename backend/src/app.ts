import compression from 'compression'
import history from 'connect-history-api-fallback'
import express from 'express'
import { createServer } from 'http'
import { join } from 'path'

import { handleApiMessage } from './api'
import { httpPort } from './config'
import { isDevelopment } from './env'

export const expressApp = express()
export const httpServer = createServer(expressApp)

export async function initExpressApp() {
  expressApp.use(history())

  expressApp.post('/api', express.json(), (req, res) => {
    if (req.body && req.body.type) {
      handleApiMessage(req.body)
      res.json({ ok: true })
    } else {
      res.json({ ok: false, error: 'Invalid message body' })
    }
  })

  if (isDevelopment) {
    const dev = await import('./development')
    dev.applyDevMiddleware(expressApp)
  } else {
    expressApp.use(compression())
    expressApp.use(express.static(join(__dirname, '../../frontend/dist')))
  }

  await new Promise(resolve => httpServer.listen(httpPort, () => resolve()))
}
