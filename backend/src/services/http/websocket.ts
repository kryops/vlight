import { ApiOutMessage } from '@vlight/types'
import ws from 'ws'
import { removeFromMutableArray, logger } from '@vlight/utils'

import { getFullState } from '../api/messages'
import { handleApiMessage } from '../api'
import { getApiHeartBeatMessage } from '../api/protocol'

import { httpServer } from './express'

/** How often we send a heartbeat and ping every connected client. */
const heartBeatInterval = 2000

/**
 * How many pings in a row a client may leave unanswered before we drop it.
 * Phones in Wi-Fi power saving mode occasionally answer late, so a single
 * missed round is not enough to give up on them.
 */
const maxMissedPongs = 2

/** The web sockets of all connected clients. */
export const sockets: ws[] = []

/** Pings sent to each socket since its last pong. */
const missedPongs = new WeakMap<ws, number>()

function removeSocket(socket: ws) {
  if (!sockets.includes(socket)) return
  logger.info('Socket disconnected')
  removeFromMutableArray(sockets, socket)
}

/**
 * Drops clients that stopped answering pings, then pings the rest.
 *
 * A client that leaves the network without closing the connection would
 * otherwise stay in the broadcast list until the OS gives up on the TCP
 * connection, buffering every update in the meantime.
 */
export function checkSockets(): void {
  // removing mutates the array, so iterate over a copy
  for (const socket of sockets.slice()) {
    const missed = missedPongs.get(socket) ?? 0
    if (missed >= maxMissedPongs) {
      logger.warn('Socket did not respond to ping, terminating')
      removeSocket(socket)
      socket.terminate()
      continue
    }

    missedPongs.set(socket, missed + 1)
    socket.ping()
  }
}

export function registerSocket(socket: ws): void {
  logger.info('Socket connected')
  sockets.push(socket)
  missedPongs.set(socket, 0)

  socket.on('message', message => {
    logger.trace('incoming message:', message)
    let parsed: any
    try {
      parsed = JSON.parse(message.toString())
    } catch {
      logger.warn('Ignoring unparsable WebSocket message')
      return
    }
    handleApiMessage(parsed)
  })

  socket.on('pong', () => missedPongs.set(socket, 0))

  socket.on('close', () => removeSocket(socket))
  socket.on('error', () => removeSocket(socket))

  sendSocketMessage(socket, getFullState())
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
  wsServer.on('connection', registerSocket)

  setInterval(() => {
    checkSockets()
    broadcastToSockets(getApiHeartBeatMessage())
  }, heartBeatInterval)
}
