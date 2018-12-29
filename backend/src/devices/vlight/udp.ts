import { createSocket, Socket } from 'dgram'

import { udpMulticastAddress, udpPort, udpUniverseInterval } from '../../config'
import { getUniverse } from '../../universe'

import { getBinaryUniverseMessage } from './protocol'

let udpSocket: Socket

export async function initUdpMulticast() {
  setInterval(() => {
    sendUdpMulticastMessage(getBinaryUniverseMessage(getUniverse()))
  }, udpUniverseInterval)

  await new Promise(resolve => {
    udpSocket = createSocket({ type: 'udp4', reuseAddr: true })
    udpSocket.bind(udpPort, () => {
      udpSocket.setBroadcast(true)
      udpSocket.setMulticastTTL(4)
      udpSocket.addMembership(udpMulticastAddress)
      resolve()
    })
  })
}

export function sendUdpMulticastMessage(message: Buffer) {
  if (udpSocket !== undefined) {
    udpSocket.send(message, udpPort)
  }
}
