import { ApiOutMessage } from '@vlight/api'
import ws from 'ws'

import { removeFromMutableArray, logger } from '../../util/shared'
import { getFullState } from '../api/messages'
import { handleApiMessage } from '../api'

import { httpServer } from './express'

export const sockets: ws[] = []

function removeSocket(socket: ws) {
  logger.info('Socket disconnected')
  removeFromMutableArray(sockets, socket)
}

function sendSocketMessage(socket: ws, message: ApiOutMessage) {
  const messageString = JSON.stringify(message)
  socket.send(messageString)
}

export async function initWebSocketServer(): Promise<void> {
  const wsServer = new ws.Server({ server: httpServer, path: '/ws' })
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
}

const skipLoggingForMessageTypes = new Set<ApiOutMessage['type']>([
  'state',
  'masterdata',
])

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
