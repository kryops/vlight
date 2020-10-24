import { createServer, Socket } from 'net'

import { removeFromMutableArray, logger } from '@vlight/utils'

import { tcpPort } from '../../services/config'
import { getDmxUniverse } from '../../services/universe'
import { getAddressString } from '../../util/network'

import { getBinaryUniverseMessage } from './protocol'

const sockets: Socket[] = []

function disconnectSocket(socket: Socket) {
  logger.info(`TCP socket disconnected ${getAddressString(socket.address())}`)
  removeFromMutableArray(sockets, socket)
}

function handleConnection(socket: Socket) {
  logger.info(`TCP connection from ${socket.remoteAddress}`)
  sockets.push(socket)

  socket.on('end', () => disconnectSocket(socket))
  socket.on('error', () => disconnectSocket(socket))

  socket.write(getBinaryUniverseMessage(getDmxUniverse()))
}

export async function initTcpServer(): Promise<void> {
  const server = createServer(handleConnection)
  await new Promise<void>(resolve => server.listen(tcpPort, () => resolve()))
}

export function sendTcpBroadcastMessage(message: Buffer): void {
  if (!sockets.length) {
    return
  }
  logger.trace('broadcast vLight TCP message', message)
  sockets.forEach(socket => socket.write(message))
}
