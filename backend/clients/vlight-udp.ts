import { createSocket } from 'dgram'

import { udpMulticastAddress, udpPort } from '../src/services/config'
import { logInfo } from '../src/util/log'
import { getAddressString } from '../src/util/network'

const socket = createSocket({ type: 'udp4', reuseAddr: true })

socket.on('listening', () => {
  logInfo(`UDP client listening on ${getAddressString(socket.address())}`)
  socket.setBroadcast(true)
  socket.setMulticastTTL(4)
  socket.addMembership(udpMulticastAddress)
})

socket.on('message', (message, remote) => {
  logInfo(`Message from ${remote.address}:${remote.port}:`, message)
})

socket.bind(udpPort)
