import { devicesFlushInterval } from '../../config'
import { getUniverse } from '../../universe'

import { getMultipleBinaryChannelMessages } from './protocol'
import { initTcpServer, sendTcpBroadcastMessage } from './tcp'
import { initUdpMulticast, sendUdpMulticastMessage } from './udp'

const changedChannels: Set<number> = new Set<number>()

function flushVlightDevices() {
  if (changedChannels.size === 0) {
    return
  }
  const message = getMultipleBinaryChannelMessages(
    getUniverse(),
    Array.from(changedChannels)
  )

  sendTcpBroadcastMessage(message)
  sendUdpMulticastMessage(message)

  changedChannels.clear()
}

export function setChannelChanged(channel: number) {
  changedChannels.add(channel)
}

export async function initVlightDevices() {
  await Promise.all([initTcpServer(), initUdpMulticast()])

  setInterval(flushVlightDevices, devicesFlushInterval)
}
