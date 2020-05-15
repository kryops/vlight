const startTime = Date.now()

import sourceMapSupport from 'source-map-support'

import { initApi } from './services/api'
import { httpServer } from './services/http/express'
import { httpPort } from './services/config'
import { initControls } from './controls'
import { initDatabase } from './services/database'
import { initDevices } from './devices'
import { isDevelopment } from './services/env'
import { logError, logInfo, logWarn } from './util/log'
import { initHttpServer } from './services/http'
import { initMasterData } from './services/masterdata'
import { initPersistedState } from './services/state'

sourceMapSupport.install()

// we want to keep the process running under all circumstances

process.on('uncaughtException', err => {
  logError('UNCAUGHT EXCEPTION', err)
})

process.on('unhandledRejection', err => {
  logError('UNHANDLED REJECTION', err)
})

// ...except for when we actually want to kill it

if (!isDevelopment) {
  process.on('SIGINT', () => {
    logWarn('SIGINT received, exiting...')
    process.exit()
  })
}

// actual initialization

async function init() {
  await initDatabase()

  await Promise.all([initPersistedState(), initMasterData()])

  await Promise.all([
    initHttpServer(),
    initApi(),
    initControls(),
    initDevices(),
  ])

  await new Promise(resolve => httpServer.listen(httpPort, resolve))

  const startDuration = (Date.now() - startTime) / 1000
  logInfo(
    `vLight started on http://127.0.0.1:${httpPort} (took ${startDuration}s)`
  )
}

init()
