const startTime = Date.now()

import sourceMapSupport from 'source-map-support'

import { initApi } from './api'
import { httpServer, initExpressApp } from './app'
import { httpPort } from './config'
import { initDatabase } from './database'
import { initArtNetServer } from './devices/artnet'
import { initUsbDmxDevices } from './devices/usbdmx'
import { initVlightDevices } from './devices/vlight'
import { isDevelopment } from './env'
import { initChannels } from './universe/channels'
import { initFixtures } from './universe/fixtures'
import { logError, logInfo, logWarn } from './util/log'
import { initFixtureGroups } from './universe/fixture-groups'

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

  await Promise.all([
    initExpressApp(),
    initApi(),
    initVlightDevices(),
    initUsbDmxDevices(),
    initArtNetServer(),
    initChannels(),
    initFixtures(),
    initFixtureGroups(),
  ])

  await new Promise(resolve => httpServer.listen(httpPort, resolve))

  const startDuration = (Date.now() - startTime) / 1000
  logInfo(
    `vLight started on http://127.0.0.1:${httpPort} (took ${startDuration}s)`
  )
}

init()
