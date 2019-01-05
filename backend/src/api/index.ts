import { ApiInMessage } from '@vlight/api'

import { socketFlushInterval } from '../config'
import { getUniverse, setChannel } from '../universe'
import { logError } from '../util/log'

import { getApiChannelsMessage } from './protocol'
import { broadcastToSockets, initWebSocketServer } from './websocket'

const changedChannels: Set<number> = new Set<number>()

function flushWebSockets() {
  if (changedChannels.size === 0) {
    return
  }
  const message = getApiChannelsMessage(
    getUniverse(),
    Array.from(changedChannels)
  )

  broadcastToSockets(message)

  changedChannels.clear()
}

export function handleApiMessage(message: ApiInMessage) {
  switch (message.type) {
    case 'channels':
      for (const [channel, value] of Object.entries(message.channels)) {
        setChannel(+channel, value)
      }
      break

    default:
      logError('Invalid API message', message)
  }
}

export function broadcastChannelToSockets(channel: number) {
  changedChannels.add(channel)
}

export async function initApi() {
  await initWebSocketServer()

  setInterval(flushWebSockets, socketFlushInterval)
}
