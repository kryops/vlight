import { ApiInMessage } from '@vlight/api'

import {
  multiChannelUniverseFlushThreshold,
  socketFlushInterval,
} from '../config'
import { getDmxUniverse } from '../services/universe'
import { setChannel } from '../controls/channels'
import { setFixtureState } from '../controls/fixtures'
import { setFixtureGroupState } from '../controls/fixture-groups'
import { setMemoryState } from '../controls/memories'
import { logError, logTrace } from '../util/log'
import { assertNever } from '../util/typescript'
import { howLong } from '../util/time'

import { getApiUniverseDeltaMessage, getApiUniverseMessage } from './protocol'
import { broadcastToSockets, initWebSocketServer, sockets } from './websocket'
import { getFullState } from './messages'

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

  let changed = false

  switch (message.type) {
    case 'channels':
      for (const [channel, value] of Object.entries(message.channels)) {
        if (setChannel(+channel, value)) {
          changed = true
        }
      }
      break

    case 'fixture':
      setFixtureState(message.id, message.state)
      changed = true // always broadcast
      break

    case 'fixture-group':
      setFixtureGroupState(message.id, message.state)
      changed = true // always broadcast
      break

    case 'memory':
      setMemoryState(message.id, message.state)
      changed = true // always broadcast
      break

    default:
      assertNever(message)
      logError('Invalid API message', message)
  }

  if (changed) {
    broadcastToSockets(message)
  } else {
    logTrace('Skipping broadcast of non-changing message', message)
  }
}

export function broadcastUniverseChannelToSockets(channel: number) {
  if (!sockets.length) {
    return
  }
  changedUninverseChannels.add(channel)
}

export async function initApi() {
  const start = Date.now()
  await initWebSocketServer()

  setInterval(flushWebSockets, socketFlushInterval)
  howLong(start, 'initApi')
}

export function broadcastApplicationStateToSockets() {
  broadcastToSockets(getFullState())
  changedUninverseChannels.clear()
}
