import * as artnet from './artnet'
import * as usbDmx from './usbdmx'
import * as vlight from './vlight'
import { deviceRegistry } from './registry'

/**
 * Initializes all device controllers in parallel.
 */
export async function initDevices(): Promise<void> {
  await Promise.all(
    [artnet, usbDmx, vlight].map(deviceController => deviceController.init())
  )
}

/**
 * Broadcasts the given DMX channel to all connected devices.
 *
 * Usually, the changes are collected and only actually broadcast in certain intervals.
 */
export function broadcastUniverseChannelToDevices(
  channel: number,
  value: number
): void {
  deviceRegistry.entries.forEach(entry =>
    entry.broadcastUniverseChannel(channel, value)
  )
}
