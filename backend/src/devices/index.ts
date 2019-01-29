import { broadcastArtNetChannel } from './artnet'
import { setChannelChangedForUsbDmxDevices } from './usbdmx'
import { setChannelChangedForVlightDevices } from './vlight'

export function broadcastUniverseChannelToDevices(
  channel: number,
  value: number
) {
  broadcastArtNetChannel(channel, value)
  setChannelChangedForVlightDevices(channel)
  setChannelChangedForUsbDmxDevices(channel)
}
