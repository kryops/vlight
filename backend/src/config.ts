import { isDevelopment } from './env'

export interface VLightConfiguration {
  httpPort: number
  enableVLightDevices: boolean
  tcpPort: number
  udpPort: number
  udpMulticastAddress: string
  udpUniverseInterval: number
  enableArtNetDevices: boolean
  artnetHost: string
  enableUsbDmxDevices: boolean
  usbDmxVid: number
  usbDmxPid: number
  devicesFlushInterval: number
  socketFlushInterval: number
  multiChannelUniverseFlushThreshold: number
  logLevel: LogLevel
  universeSize: number
  statePersistenceFlushInterval: number
}

const userConfig: Partial<VLightConfiguration> = require('../../config/vlight-config') // eslint-disable-line @typescript-eslint/no-var-requires

function c<T extends keyof VLightConfiguration>(
  key: T,
  defaultValue: VLightConfiguration[T]
): VLightConfiguration[T] {
  const userValue = userConfig[key] as VLightConfiguration[T] | undefined
  return userValue !== undefined ? userValue! : defaultValue
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
export const socketFlushInterval = c('socketFlushInterval', 50)
export const multiChannelUniverseFlushThreshold = c(
  'multiChannelUniverseFlushThreshold',
  200
)

export type LogLevel = 'trace' | 'info' | 'warn' | 'error'

export const logLevel = c('logLevel', isDevelopment ? 'trace' : 'info')

// application config
export const universeSize = c('universeSize', 512)
export const statePersistenceFlushInterval = c(
  'statePersistenceFlushInterval',
  10000
)
