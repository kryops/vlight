import { createSocket, Socket } from 'dgram'

import { udpMulticastAddress, udpPort, udpUniverseInterval } from '../../config'
import { getDmxUniverse } from '../../universe'
import { logTrace } from '../../util/log'

import { getBinaryUniverseMessage } from './protocol'

let udpSocket: Socket

export async function initUdpMulticast() {
  setInterval(() => {
    sendUdpMulticastMessage(getBinaryUniverseMessage(getDmxUniverse()))
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
    // ignore the periodic universe messages
    if (message.length !== 513) {
      logTrace('broadcast vLight UDP message', message)
    }
    udpSocket.send(message, udpPort)
  }
}
