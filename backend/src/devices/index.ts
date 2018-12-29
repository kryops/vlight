import { broadcastArtNetChannel } from './artnet'
import { getBinaryChannelMessage } from './vlight/protocol'
import { sendTcpBroadcastMessage } from './vlight/tcp'
import { sendUdpMulticastMessage } from './vlight/udp'

export function broadcastChannelToDevices(channel: number, value: number) {
  broadcastArtNetChannel(channel, value)
  const message = getBinaryChannelMessage(channel, value)
  sendUdpMulticastMessage(message)
  sendTcpBroadcastMessage(message)
}
