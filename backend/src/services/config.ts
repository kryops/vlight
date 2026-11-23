import { join, resolve } from 'path'

import { LogLevel } from '@vlight/utils'

import { isDevelopment } from './env'

/**
 * Global application configuration.
 * Can be configured in `/config/vlight-config.js`
 * (or `vlight-config.js` in `VLIGHT_CONFIG_DIR`).
 */
export interface VLightConfiguration {
  //
  // Application
  //

  /**
   * The currently active project.
   *
   * Defaults to `default`.
   */
  project: string

  /**
   * The log level the application logs into the console with.
   *
   * Default to `info` in production and `debug` in development.
   */
  logLevel: LogLevel | `${LogLevel}`

  /**
   * The size of the DMX universe.
   *
   * Defaults to 512.
   */
  universeSize: number

  /**
   * The interval in ms that the application state is written to disk.
   *
   * Defaults to 10000 (10 seconds).
   */
  statePersistenceFlushInterval: number

  /**
   * Controls whether changes to the master data and the application state
   * are only kept in memory instead of being written to disk.
   *
   * Used for E2E tests.
   *
   * Defaults to `false`.
   */
  readOnly: boolean

  //
  // Clients
  //

  /**
   * The HTTP port the server listens on.
   *
   * Can be overridden with the `VLIGHT_HTTP_PORT` environment variable.
   *
   * Defaults to 8000.
   */
  httpPort: number

  /**
   * The interval in which DMX changes are flushed to connected devices.
   *
   * Defaults to 20 (= 50fps).
   */
  socketFlushInterval: number

  /**
   * The maximum number of changed channels before the full universe
   * is sent to clients instead of the diff.
   *
   * Defaults to 200.
   */
  multiChannelUniverseFlushThreshold: number

  //
  // Devices
  //

  /**
   * Controls whether vLight TCP/UDP devices are enabled.
   *
   * Defaults to `true`.
   */
  enableVLightDevices: boolean

  /**
   * The TCP port for the vLight devices.
   *
   * Defaults to 43235.
   */
  tcpPort: number

  /**
   * The UDP port for the vLight devices.
   *
   * Defaults to 43234.
   */
  udpPort: number

  /**
   * The UDP multicast address for the vLight devices.
   *
   * Defaults to `224.0.0.244`.
   */
  udpMulticastAddress: string

  /**
   * The inverval in ms for the vLight UDP devices to be broadcast the full
   * DMX universe.
   *
   * Defaults to 1000.
   */
  udpUniverseInterval: number

  /**
   * Controls whether ArtNet devices are enabled.
   *
   * Defaults to `true`.
   */
  enableArtNetDevices: boolean

  /**
   * The ArtNet device host.
   *
   * Defaults to `255.255.255.255`.
   */
  artnetHost: string

  /**
   * The ArtNet universe.
   *
   * Defaults to `0`.
   */
  artnetUniverse: number

  /**
   * Controls whether USB DMX devices are enabled.
   *
   * Defaults to `true`.
   */
  enableUsbDmxDevices: boolean

  /**
   * The VID for USB DMX devices.
   *
   * Defaults to 1204.
   */
  usbDmxVid: number

  /**
   * The PID for USB DMX devices.
   *
   * Defaults to 3871.
   */
  usbDmxPid: number

  /**
   * The interval in which DMX changes are flushed to connected devices.
   *
   * Defaults to 20 (= 50fps).
   */
  devicesFlushInterval: number
}

/**
 * The directory containing the configuration and the projects.
 *
 * Can be overridden with the `VLIGHT_CONFIG_DIR` environment variable.
 */
export const configDirectoryPath = process.env.VLIGHT_CONFIG_DIR
  ? resolve(process.env.VLIGHT_CONFIG_DIR)
  : join(__dirname, '../../../config')

const userConfig: Partial<VLightConfiguration> = require(
  join(configDirectoryPath, 'vlight-config')
)

function c<T extends keyof VLightConfiguration>(
  key: T,
  defaultValue: VLightConfiguration[T]
): VLightConfiguration[T] {
  const userValue = userConfig[key] as VLightConfiguration[T] | undefined
  return userValue !== undefined ? userValue! : defaultValue
}

// Application

export const project = c('project', 'default')
export const logLevel = c(
  'logLevel',
  isDevelopment ? LogLevel.Debug : LogLevel.Info
)
export const universeSize = c('universeSize', 512)
export const statePersistenceFlushInterval = c(
  'statePersistenceFlushInterval',
  10000
)
export const readOnly = c('readOnly', false)

// Clients

export const httpPort = process.env.VLIGHT_HTTP_PORT
  ? Number(process.env.VLIGHT_HTTP_PORT)
  : c('httpPort', 8000)
export const socketFlushInterval = c('socketFlushInterval', 50)
export const multiChannelUniverseFlushThreshold = c(
  'multiChannelUniverseFlushThreshold',
  200
)

// Devices

export const enableVLightDevices = c('enableVLightDevices', true)
export const tcpPort = c('tcpPort', 43235)
export const udpPort = c('udpPort', 43234)
export const udpMulticastAddress = c('udpMulticastAddress', '224.0.0.244')
export const udpUniverseInterval = c('udpUniverseInterval', 1000)

export const enableArtNetDevices = c('enableArtNetDevices', true)
export const artnetHost = c('artnetHost', '255.255.255.255')
export const artnetUniverse = c('artnetUniverse', 0)

export const enableUsbDmxDevices = c('enableUsbDmxDevices', true)
export const usbDmxVid = c('usbDmxVid', 1204)
export const usbDmxPid = c('usbDmxPid', 3871)

export const devicesFlushInterval = c('devicesFlushInterval', 20)
