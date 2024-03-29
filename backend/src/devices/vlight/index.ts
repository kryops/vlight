import {
  devicesFlushInterval,
  enableVLightDevices,
  multiChannelUniverseFlushThreshold,
} from '../../services/config'
import { getDmxUniverse } from '../../services/universe'
import { howLong } from '../../util/time'
import { deviceRegistry } from '../registry'

import {
  getBinaryUniverseMessage,
  getMultipleBinaryChannelMessages,
} from './protocol'
import { initTcpServer, sendTcpBroadcastMessage } from './tcp'
import { initUdpMulticast, sendUdpMulticastMessage } from './udp'

/** Set of changed channels awaiting to be flushed to the devices. */
const changedChannels: Set<number> = new Set<number>()

/**
 * Flushes the changed DMX channels to the connected devices.
 */
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

function broadcastUniverseChannel(channel: number) {
  changedChannels.add(channel)
}

export async function init(): Promise<void> {
  if (!enableVLightDevices) {
    return
  }

  const start = Date.now()
  await Promise.all([initTcpServer(), initUdpMulticast()])

  setInterval(flushVlightDevices, devicesFlushInterval)

  deviceRegistry.register({ broadcastUniverseChannel })

  howLong(start, 'initVlightDevices')
}
