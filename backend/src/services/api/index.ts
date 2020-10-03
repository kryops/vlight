import { ApiInMessage, ApiOutMessage } from '@vlight/types'
import { logger } from '@vlight/utils'

import {
  multiChannelUniverseFlushThreshold,
  socketFlushInterval,
} from '../config'
import { getDmxUniverse } from '../universe'
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

export function handleApiMessage(message: ApiInMessage): void {
  logger.debug('Incoming API message', message)

  const handler = apiMessageHandlerRegistry.get(message.type)

  if (!handler) {
    logger.error('No API message handler registered for type', message.type)
  } else {
    if (handler(message)) {
      broadcastToSockets(message as ApiOutMessage)
    }
  }
}

export function broadcastUniverseChannelToApiClients(channel: number): void {
  if (!sockets.length) {
    return
  }
  changedUninverseChannels.add(channel)
}

export async function initApi(): Promise<void> {
  const start = Date.now()

  setInterval(flushChangedUniverseChannels, socketFlushInterval)
  howLong(start, 'initApi')
}

export function broadcastApplicationStateToApiClients(): void {
  broadcastToSockets(getFullState())
  changedUninverseChannels.clear()
}
