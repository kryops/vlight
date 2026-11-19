const startTime = Date.now()

import qrcode from 'qrcode-terminal'
import sourceMapSupport from 'source-map-support'
import { setLogLevel, logger, LogLevel } from '@vlight/utils'

import { initApi } from './services/api'
import { httpServer } from './services/http/express'
import { httpPort, logLevel } from './services/config'
import { initControls } from './controls'
import { initDatabase } from './services/database'
import { initDevices } from './devices'
import { isDevelopment } from './services/env'
import { initHttpServer } from './services/http'
import { initMasterData } from './services/masterdata'
import { initPersistedState } from './services/state'
import { initUniverse } from './services/universe'
import { getLocalNetworkIp } from './util/network'

sourceMapSupport.install()

// we want to keep the process running under all circumstances

process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION', err)
})

process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION', err)
})

// ...except for when we actually want to kill it

if (!isDevelopment) {
  process.on('SIGINT', () => {
    logger.warn('SIGINT received, exiting...')
    process.exit()
  })
}

setLogLevel(logLevel as LogLevel)

// actual initialization

async function init() {
  await initDatabase()

  await Promise.all([initPersistedState(), initMasterData()])

  await initUniverse()

  await Promise.all([
    initHttpServer(),
    initApi(),
    initControls(),
    initDevices(),
  ])

  await new Promise<void>(resolve => httpServer.listen(httpPort, resolve))

  const startDuration = (Date.now() - startTime) / 1000
  logger.info(
    `vLight started on http://127.0.0.1:${httpPort} (took ${startDuration}s)`
  )

  const networkIp = getLocalNetworkIp()
  if (networkIp) {
    const networkAddress = `http://${networkIp}:${httpPort}`
    logger.info(`Network address: ${networkAddress}`)

    qrcode.generate(networkAddress, { small: true }, url => {
      console.log(url)
    })
  }
}

init()
