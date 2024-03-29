import { createServer } from 'http'
import { join } from 'path'

import compression from 'compression'
import history from 'connect-history-api-fallback'
import express from 'express'

import { handleApiMessage } from '../api'

/** The Express application serving the frontend and the REST API. */
const expressApp = express()

/** The application's HTTP server for connecting clients. */
export const httpServer = createServer(expressApp)

export async function initExpressApp(): Promise<void> {
  expressApp.use(history())

  expressApp.post('/api', express.json(), (req, res) => {
    if (req.body?.type) {
      handleApiMessage(req.body)
      res.json({ ok: true })
    } else {
      res.json({ ok: false, error: 'Invalid message body' })
    }
  })

  expressApp.use(compression())
  expressApp.use(express.static(join(__dirname, '../../../../frontend/dist')))
}
