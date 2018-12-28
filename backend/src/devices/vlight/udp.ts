import { createSocket } from 'dgram'

import { udpMulticastAddress, udpPort, udpUniverseInterval } from '../../config'
import { getUniverse } from '../../universe'
import { logInfo } from '../../util/log'

import { getUniverseMessage } from './protocol'

const udpSocket = createSocket({ type: 'udp4', reuseAddr: true })

export function initUdpMulticast() {
  udpSocket.bind(udpPort, () => {
    udpSocket.setBroadcast(true)
    udpSocket.setMulticastTTL(4)
    udpSocket.addMembership(udpMulticastAddress)
  })

  setInterval(() => {
    sendUdpMulticastMessage(getUniverseMessage(getUniverse()))
  }, udpUniverseInterval)
}

export function sendUdpMulticastMessage(message: Buffer) {
  logInfo(message)
  udpSocket.send(message, udpPort)
}
