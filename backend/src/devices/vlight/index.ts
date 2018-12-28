import { getChannelMessage } from './protocol'
import { sendUdpMulticastMessage } from './udp'

export function broadcastChannel(channel: number, value: number) {
  const message = getChannelMessage(channel, value)
  sendUdpMulticastMessage(message)
  // TODO TCP broadcast
}
