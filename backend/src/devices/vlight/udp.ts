import { createSocket } from 'dgram'

import { udpMulticastAddress, udpPort, udpUniverseInterval } from '../../config'
import { getUniverse } from '../../universe'

import { getUniverseMessage } from './protocol'

const udpSocket = createSocket({ type: 'udp4', reuseAddr: true })

export async function initUdpMulticast() {
  setInterval(() => {
    sendUdpMulticastMessage(getUniverseMessage(getUniverse()))
  }, udpUniverseInterval)

  await new Promise(resolve => {
    udpSocket.bind(udpPort, () => {
      udpSocket.setBroadcast(true)
      udpSocket.setMulticastTTL(4)
      udpSocket.addMembership(udpMulticastAddress)
      resolve()
    })
  })
}

export function sendUdpMulticastMessage(message: Buffer) {
  udpSocket.send(message, udpPort)
}
