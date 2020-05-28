import { createSocket, Socket } from 'dgram'

import {
  udpMulticastAddress,
  udpPort,
  udpUniverseInterval,
} from '../../services/config'
import { getDmxUniverse } from '../../services/universe'
import { logTrace, logError } from '../../util/log'

import { getBinaryUniverseMessage } from './protocol'

let udpSocket: Socket

export async function initUdpMulticast(): Promise<void> {
  setInterval(() => {
    sendUdpMulticastMessage(getBinaryUniverseMessage(getDmxUniverse()))
  }, udpUniverseInterval)

  await new Promise(resolve => {
    udpSocket = createSocket({ type: 'udp4', reuseAddr: true })
    udpSocket.bind(udpPort, () => {
      udpSocket.setBroadcast(true)
      udpSocket.setMulticastTTL(4)
      try {
        udpSocket.addMembership(udpMulticastAddress)
      } catch (e) {
        logError('Could not bind UDP multicast socket:', e)
      }
      resolve()
    })
  })
}

export function sendUdpMulticastMessage(message: Buffer): void {
  if (udpSocket !== undefined) {
    // ignore the periodic universe messages
    if (message.length !== 513) {
      logTrace('broadcast vLight UDP message', message)
    }
    udpSocket.send(message, udpPort)
  }
}
