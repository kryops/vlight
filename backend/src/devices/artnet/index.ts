import artnet, { Artnet } from 'artnet'

import { artnetHost, enableArtNetDevices } from '../../config'
import { getDmxUniverse } from '../../universe'

let server: Artnet

export async function initArtNetServer() {
  if (!enableArtNetDevices) {
    return
  }

  server = artnet({ host: artnetHost })

  server.set(Array.from(getDmxUniverse()))
}

export function broadcastArtNetChannel(channel: number, value: number) {
  if (!enableArtNetDevices || server === undefined) {
    return
  }
  server.set(channel, value)
}
