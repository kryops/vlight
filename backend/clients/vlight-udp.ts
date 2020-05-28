import { createSocket } from 'dgram'

import { udpMulticastAddress, udpPort } from '../src/services/config'
import { logger } from '../src/util/shared'
import { getAddressString } from '../src/util/network'

const socket = createSocket({ type: 'udp4', reuseAddr: true })

socket.on('listening', () => {
  logger.info(`UDP client listening on ${getAddressString(socket.address())}`)
  socket.setBroadcast(true)
  socket.setMulticastTTL(4)
  socket.addMembership(udpMulticastAddress)
})

socket.on('message', (message, remote) => {
  logger.info(`Message from ${remote.address}:${remote.port}:`, message)
})

socket.bind(udpPort)
