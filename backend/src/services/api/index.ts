import { ApiInMessage, ApiOutMessage } from '@vlight/api'

import {
  multiChannelUniverseFlushThreshold,
  socketFlushInterval,
} from '../config'
import { getDmxUniverse } from '../universe'
import { logError, logTrace } from '../../util/log'
import { howLong } from '../../util/time'
import { broadcastToSockets, sockets } from '../http/websocket'

import { getApiUniverseDeltaMessage, getApiUniverseMessage } from './protocol'
import { getFullState } from './messages'
import { apiMessageHandlerRegistry } from './registry'

const changedUninverseChannels: Set<number> = new Set<number>()

function flushChangedUniverseChannels() {
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

  const handler = apiMessageHandlerRegistry.get(message.type)

  if (!handler) {
    logError('No API message handler registered for type', message.type)
  } else {
    if (handler(message)) {
      broadcastToSockets(message as ApiOutMessage)
    }
  }
}

export function broadcastUniverseChannelToApiClients(channel: number) {
  if (!sockets.length) {
    return
  }
  changedUninverseChannels.add(channel)
}

export async function initApi() {
  const start = Date.now()

  setInterval(flushChangedUniverseChannels, socketFlushInterval)
  howLong(start, 'initApi')
}

export function broadcastApplicationStateToApiClients() {
  broadcastToSockets(getFullState())
  changedUninverseChannels.clear()
}
