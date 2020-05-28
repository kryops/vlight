import { createServer, Socket } from 'net'

import { tcpPort } from '../../services/config'
import { getDmxUniverse } from '../../services/universe'
import { removeFromMutableArray } from '../../util/shared'
import { logInfo, logTrace } from '../../util/log'
import { getAddressString } from '../../util/network'

import { getBinaryUniverseMessage } from './protocol'

const sockets: Socket[] = []

function disconnectSocket(socket: Socket) {
  logInfo(`TCP socket disconnected ${getAddressString(socket.address())}`)
  removeFromMutableArray(sockets, socket)
}

function handleConnection(socket: Socket) {
  logInfo(`TCP connection from ${socket.remoteAddress}`)
  sockets.push(socket)

  socket.on('end', () => disconnectSocket(socket))
  socket.on('error', () => disconnectSocket(socket))

  socket.write(getBinaryUniverseMessage(getDmxUniverse()))
}

export async function initTcpServer(): Promise<void> {
  const server = createServer(handleConnection)
  await new Promise(resolve => server.listen(tcpPort, () => resolve()))
}

export function sendTcpBroadcastMessage(message: Buffer): void {
  if (!sockets.length) {
    return
  }
  logTrace('broadcast vLight TCP message', message)
  sockets.forEach(socket => socket.write(message))
}
