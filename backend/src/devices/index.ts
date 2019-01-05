import { broadcastArtNetChannel } from './artnet'
import { setChannelChanged } from './vlight'

export function broadcastChannelToDevices(channel: number, value: number) {
  broadcastArtNetChannel(channel, value)
  setChannelChanged(channel)
}
