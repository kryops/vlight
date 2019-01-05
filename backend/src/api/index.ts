import { ApiInMessage } from '@vlight/api'

import {
  multiChannelUniverseFlushThreshold,
  socketFlushInterval,
} from '../config'
import { getDmxUniverse, setChannel } from '../universe'
import { logError, logTrace } from '../util/log'

import { getApiUniverseDeltaMessage, getApiUniverseMessage } from './protocol'
import { broadcastToSockets, initWebSocketServer } from './websocket'

const changedUninverseChannels: Set<number> = new Set<number>()

function flushWebSockets() {
  if (changedUninverseChannels.size === 0) {
    return
  }
  const message =
    changedUninverseChannels.size < multiChannelUniverseFlushThreshold
      ? getApiUniverseDeltaMessage(
          getDmxUniverse(),
          Array.from(changedUninverseChannels)
        )
      : getApiUniverseMessage(getDmxUniverse())

  broadcastToSockets(message)

  changedUninverseChannels.clear()
}

export function handleApiMessage(message: ApiInMessage) {
  logTrace('Incoming API message', message)

  switch (message.type) {
    case 'channels':
      for (const [channel, value] of Object.entries(message.channels)) {
        setChannel(+channel, value)
      }

      broadcastToSockets(message)
      break

    default:
      logError('Invalid API message', message)
  }
}

export function broadcastUniverseChannelToSockets(channel: number) {
  changedUninverseChannels.add(channel)
}

export async function initApi() {
  await initWebSocketServer()

  setInterval(flushWebSockets, socketFlushInterval)
}
