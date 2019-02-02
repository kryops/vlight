import { isDevelopment } from './env'

// tslint:disable-next-line no-var-requires
const userConfig: { [key: string]: any } = require('../../config/vlight-config')

function c(key: string, defaultValue: boolean): boolean
function c(key: string, defaultValue: string): string
function c(key: string, defaultValue: number): number
function c<T>(key: string, defaultValue: T): T

function c<T>(key: string, defaultValue: T): T {
  const userValue = userConfig[key]
  return userValue !== undefined ? userValue : defaultValue
}

// technical config
export const httpPort = c('httpPort', 8000)

export const enableVLightDevices = c('enableVLightDevices', true)
export const tcpPort = c('tcpPort', 43235)
export const udpPort = c('udpPort', 43234)
export const udpMulticastAddress = c('udpMulticastAddress', '224.0.0.244')
export const udpUniverseInterval = c('udpUniverseInterval', 1000)

export const enableArtNetDevices = c('enableArtNetDevices', true)
export const artnetHost = c('artnetHost', '255.255.255.255')

export const enableUsbDmxDevices = c('enableUsbDmxDevices', true)
export const usbDmxVid = c('usbDmxVid', 1204)
export const usbDmxPid = c('usbDmxPid', 3871)

export const devicesFlushInterval = c('devicesFlushInterval', 20)
export const socketFlushInterval = c('socketFlushInterval', 100)
export const multiChannelUniverseFlushThreshold = c(
  'multiChannelUniverseFlushThreshold',
  200
)

export type LogLevel = 'trace' | 'info' | 'warn' | 'error'

export const logLevel = c<LogLevel>(
  'logLevel',
  isDevelopment ? 'trace' : 'info'
)

// application config
export const universeSize = c('universeSize', 512)
