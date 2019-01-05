import { ApiOutMessage } from '@vlight/api'
import ws from 'ws'

import { httpServer } from '../app'
import { getUniverse } from '../universe'
import { removeFromMutableArray } from '../util/array'
import { logInfo, logTrace } from '../util/log'

import { handleApiMessage } from '.'
import { getApiUniverseMessage } from './protocol'

const sockets: ws[] = []

function removeSocket(socket: ws) {
  logInfo('Socket disconnected')
  removeFromMutableArray(sockets, socket)
}

function sendSocketMessage(socket: ws, message: ApiOutMessage) {
  const messageString = JSON.stringify(message)
  socket.send(messageString)
}

export async function initWebSocketServer() {
  const wsServer = new ws.Server({ server: httpServer, path: '/ws' })
  wsServer.on('connection', socket => {
    logInfo('Socket connected')
    sockets.push(socket)
    socket.on('message', message => {
      handleApiMessage(JSON.parse(message.toString()))
    })

    socket.on('close', () => removeSocket(socket))
    socket.on('error', () => removeSocket(socket))

    sendSocketMessage(socket, getApiUniverseMessage(getUniverse()))
  })
}

export function broadcastToSockets(message: ApiOutMessage) {
  logTrace('broadcast WebSocket message', message)
  const messageString = JSON.stringify(message)
  sockets.forEach(socket => socket.send(messageString))
}
