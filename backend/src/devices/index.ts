import * as artnet from './artnet'
import * as usbDmx from './usbdmx'
import * as vlight from './vlight'
import { deviceRegistry } from './registry'

export async function initDevices(): Promise<void> {
  await Promise.all(
    [artnet, usbDmx, vlight].map(deviceController => deviceController.init())
  )
}

export function broadcastUniverseChannelToDevices(
  channel: number,
  value: number
): void {
  deviceRegistry.entries.forEach(entry =>
    entry.broadcastUniverseChannel(channel, value)
  )
}
