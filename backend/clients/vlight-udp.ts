import { createSocket } from 'dgram'
import { AddressInfo } from 'net'

import { udpMulticastAddress, udpPort } from '../src/config'
import { logInfo } from '../src/util/log'

const socket = createSocket({ type: 'udp4', reuseAddr: true })

socket.on('listening', () => {
  const { address, port } = socket.address() as AddressInfo
  logInfo(`UDP client listening on ${address}:${port}`)
  socket.setBroadcast(true)
  socket.setMulticastTTL(4)
  socket.addMembership(udpMulticastAddress)
})

socket.on('message', (message, remote) => {
  logInfo(`Message from ${remote.address}:${remote.port}:`, message)
})

socket.bind(udpPort)
