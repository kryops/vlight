import { getChannelMessage } from './protocol'
import { sendTcpBroadcastMessage } from './tcp'
import { sendUdpMulticastMessage } from './udp'

export function broadcastChannel(channel: number, value: number) {
  const message = getChannelMessage(channel, value)
  sendUdpMulticastMessage(message)
  sendTcpBroadcastMessage(message)
}
