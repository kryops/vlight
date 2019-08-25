import {
  devicesFlushInterval,
  enableVLightDevices,
  multiChannelUniverseFlushThreshold,
} from '../../config'
import { getDmxUniverse } from '../../services/universe'
import { howLong } from '../../util/time'

import {
  getBinaryUniverseMessage,
  getMultipleBinaryChannelMessages,
} from './protocol'
import { initTcpServer, sendTcpBroadcastMessage } from './tcp'
import { initUdpMulticast, sendUdpMulticastMessage } from './udp'

const changedChannels: Set<number> = new Set<number>()

function flushVlightDevices() {
  if (changedChannels.size === 0) {
    return
  }

  const message =
    changedChannels.size < multiChannelUniverseFlushThreshold
      ? getMultipleBinaryChannelMessages(
          getDmxUniverse(),
          Array.from(changedChannels)
        )
      : getBinaryUniverseMessage(getDmxUniverse())

  sendTcpBroadcastMessage(message)
  sendUdpMulticastMessage(message)

  changedChannels.clear()
}

export function setChannelChangedForVlightDevices(channel: number) {
  if (!enableVLightDevices) {
    return
  }

  changedChannels.add(channel)
}

export async function initVlightDevices() {
  if (!enableVLightDevices) {
    return
  }

  const start = Date.now()
  await Promise.all([initTcpServer(), initUdpMulticast()])

  setInterval(flushVlightDevices, devicesFlushInterval)
  howLong(start, 'initVlightDevices')
}
