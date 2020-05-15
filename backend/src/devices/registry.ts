import { ListRegistry } from '../util/registry'

export interface Device {
  broadcastUniverseChannel: (
    channel: number,
    value: number
  ) => void | Promise<void>
}

export const deviceRegistry = new ListRegistry<Device>()
