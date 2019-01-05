import { broadcastArtNetChannel } from './artnet'
import { setChannelChanged } from './vlight'

export function broadcastUniverseChannelToDevices(
  channel: number,
  value: number
) {
  broadcastArtNetChannel(channel, value)
  setChannelChanged(channel)
}
