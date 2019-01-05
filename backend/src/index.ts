import sourceMapSupport from 'source-map-support'

import { initWebSocketApi } from './api/websocket'
import { initExpressApp } from './app'
import { httpPort } from './config'
import { initArtNetServer } from './devices/artnet'
import { initVlightDevices } from './devices/vlight'
import { logError, logInfo } from './util/log'

sourceMapSupport.install()

// we want to keep the process running under all circumstances

process.on('uncaughtException', err => {
  logError('UNCAUGHT EXCEPTION', err)
})

process.on('unhandledRejection', err => {
  logError('UNHANDLED REJECTION', err)
})

// actual initialization

const initialization = [
  initExpressApp(),
  initWebSocketApi(),
  initVlightDevices(),
  initArtNetServer(),
]

Promise.all(initialization).then(() =>
  logInfo(`vLight started on http://127.0.0.1:${httpPort}`)
)
