import { ApiInMessage } from '@vlight/api'

import {
  multiChannelUniverseFlushThreshold,
  socketFlushInterval,
} from '../config'
import {
  channelUniverse,
  getDmxUniverse,
  setUniverseChannel,
} from '../universe'
import { logError, logTrace } from '../util/log'

import { getApiUniverseDeltaMessage, getApiUniverseMessage } from './protocol'
import { broadcastToSockets, initWebSocketServer, sockets } from './websocket'

const changedUninverseChannels: Set<number> = new Set<number>()

function flushWebSockets() {
  if (!sockets.length || changedUninverseChannels.size === 0) {
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
      let changed = false
      for (const [channel, value] of Object.entries(message.channels)) {
        if (setUniverseChannel(channelUniverse, +channel, value)) {
          changed = true
        }
      }

      if (changed) {
        broadcastToSockets(message)
      }
      break

    default:
      logError('Invalid API message', message)
  }
}

export function broadcastUniverseChannelToSockets(channel: number) {
  if (!sockets.length) {
    return
  }
  changedUninverseChannels.add(channel)
}

export async function initApi() {
  await initWebSocketServer()

  setInterval(flushWebSockets, socketFlushInterval)
}
