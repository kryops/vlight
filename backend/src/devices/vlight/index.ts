import { getBinaryChannelMessage } from './protocol'
import { sendTcpBroadcastMessage } from './tcp'
import { sendUdpMulticastMessage } from './udp'

export function broadcastChannelToDevices(channel: number, value: number) {
  const message = getBinaryChannelMessage(channel, value)
  sendUdpMulticastMessage(message)
  sendTcpBroadcastMessage(message)
}
