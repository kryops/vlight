import { ListRegistry } from '../util/registry'

/**
 * Common interface that represents the controller of a certain device (e.g. ArtNet) within the backend.
 */
export interface Device {
  /**
   * Broadcasts the given DMX channel to all connected devices.
   *
   * Usually, the changes are collected and only actually broadcast in certain intervals.
   */
  broadcastUniverseChannel: (
    channel: number,
    value: number
  ) => void | Promise<void>
}

/**
 * Registry of all device controllers.
 * Each device controller should register here in its `init` function.
 */
export const deviceRegistry = new ListRegistry<Device>()
