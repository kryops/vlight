import { howLong } from '../../util/time'

import { initWebSocketServer } from './websocket'
import { initExpressApp } from './express'

export async function initHttpServer() {
  const start = Date.now()
  await initExpressApp()
  await initWebSocketServer()
  howLong(start, 'initHttpServer')
}
