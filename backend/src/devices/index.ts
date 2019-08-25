import { broadcastArtNetChannel, initArtNetServer } from './artnet'
import { setChannelChangedForUsbDmxDevices, initUsbDmxDevices } from './usbdmx'
import { setChannelChangedForVlightDevices, initVlightDevices } from './vlight'

export async function initDevices() {
  await Promise.all([
    initVlightDevices(),
    initUsbDmxDevices(),
    initArtNetServer(),
  ])
}

export function broadcastUniverseChannelToDevices(
  channel: number,
  value: number
) {
  broadcastArtNetChannel(channel, value)
  setChannelChangedForVlightDevices(channel)
  setChannelChangedForUsbDmxDevices(channel)
}
