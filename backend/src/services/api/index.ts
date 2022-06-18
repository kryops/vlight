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

/** Set of changed DMX universe channels awaiting to be flushed to the connected clients. */
const changedUninverseChannels: Set<number> = new Set<number>()

/**
 * Flushes the changed universe changes to all connected clients.
 *
 * If too many channels were changed, it sends the complete DMX universe instead.
 */
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

/**
 * Main handler for API messages via websocket or REST API.
 * May be called programmatically from the backend as well to trigger changes.
 *
 * Calls the API message handler for the given message type.
 * If anything changed (i.e. the handler returned `true`), the message is broadcast
 * to all connected clients.
 */
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

/**
 * Marks the given universe channel as changed, to be flushed in the next batch.
 */
export function broadcastUniverseChannelToApiClients(channel: number): void {
  if (!sockets.length) {
    return
  }
  changedUninverseChannels.add(channel)
}

/**
 * Broadcasts the complete application state including the master data to all connected clients.
 */
export function broadcastApplicationStateToApiClients(): void {
  broadcastToSockets(getFullState())
  changedUninverseChannels.clear()
}

export async function initApi(): Promise<void> {
  const start = Date.now()

  setInterval(flushChangedUniverseChannels, socketFlushInterval)
  howLong(start, 'initApi')
}
