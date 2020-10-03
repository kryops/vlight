import { createSocket } from 'dgram'

import { logger } from '@vlight/utils'

import { udpMulticastAddress, udpPort } from '../src/services/config'
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
