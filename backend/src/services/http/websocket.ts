import { ApiOutMessage } from '@vlight/types'
import ws from 'ws'
import { removeFromMutableArray, logger } from '@vlight/utils'

import { getFullState } from '../api/messages'
import { handleApiMessage } from '../api'
import { getApiHeartBeatMessage } from '../api/protocol'

import { httpServer } from './express'

/** The web sockets of all connected clients. */
export const sockets: ws[] = []

function removeSocket(socket: ws) {
  logger.info('Socket disconnected')
  removeFromMutableArray(sockets, socket)
}

function sendSocketMessage(socket: ws, message: ApiOutMessage) {
  const messageString = JSON.stringify(message)
  socket.send(messageString)
}

/** Set of API message types whose contents are not logged when broadcasting. */
const skipLoggingForMessageTypes = new Set<ApiOutMessage['type']>([
  'state',
  'masterdata',
])

/**
 * Broadcasts the given message to all connected clients.
 */
export function broadcastToSockets(message: ApiOutMessage): void {
  if (!sockets.length) {
    return
  }
  const info = skipLoggingForMessageTypes.has(message.type)
    ? message.type
    : message
  logger.debug('broadcast WebSocket message', info)
  const messageString = JSON.stringify(message)
  sockets.forEach(socket => socket.send(messageString))
}

export async function initWebSocketServer(): Promise<void> {
  const wsServer = new ws.Server({ server: httpServer, path: '/websocket' })
  wsServer.on('connection', socket => {
    logger.info('Socket connected')
    sockets.push(socket)
    socket.on('message', message => {
      handleApiMessage(JSON.parse(message.toString()))
    })

    socket.on('close', () => removeSocket(socket))
    socket.on('error', () => removeSocket(socket))

    sendSocketMessage(socket, getFullState())
  })

  setInterval(() => {
    broadcastToSockets(getApiHeartBeatMessage())
  }, 2000)
}
