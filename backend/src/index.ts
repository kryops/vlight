import sourceMapSupport from 'source-map-support'

import { initExpressApp } from './app'
import { initUdpMulticast } from './devices/vlight/udp'
import { logError } from './util/log'

sourceMapSupport.install()

// we want to keep the process running under all circumstances

process.on('uncaughtException', err => {
  logError('UNCAUGHT EXCEPTION', err)
})

process.on('unhandledRejection', err => {
  logError('UNHANDLED REJECTION', err)
})

// actual initialization

initExpressApp()

initUdpMulticast()
