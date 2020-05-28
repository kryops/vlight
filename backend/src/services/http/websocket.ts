import { ApiOutMessage } from '@vlight/api'
import ws from 'ws'

import { removeFromMutableArray } from '../../util/shared'
import { logInfo, logTrace } from '../../util/log'
import { getFullState } from '../api/messages'
import { handleApiMessage } from '../api'

import { httpServer } from './express'

export const sockets: ws[] = []

function removeSocket(socket: ws) {
  logInfo('Socket disconnected')
  removeFromMutableArray(sockets, socket)
}

function sendSocketMessage(socket: ws, message: ApiOutMessage) {
  const messageString = JSON.stringify(message)
  socket.send(messageString)
}

export async function initWebSocketServer(): Promise<void> {
  const wsServer = new ws.Server({ server: httpServer, path: '/ws' })
  wsServer.on('connection', socket => {
    logInfo('Socket connected')
    sockets.push(socket)
    socket.on('message', message => {
      handleApiMessage(JSON.parse(message.toString()))
    })

    socket.on('close', () => removeSocket(socket))
    socket.on('error', () => removeSocket(socket))

    sendSocketMessage(socket, getFullState())
  })
}

export function broadcastToSockets(message: ApiOutMessage): void {
  if (!sockets.length) {
    return
  }
  logTrace('broadcast WebSocket message', message)
  const messageString = JSON.stringify(message)
  sockets.forEach(socket => socket.send(messageString))
}
