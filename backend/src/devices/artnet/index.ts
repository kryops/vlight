import artnet, { Artnet } from 'artnet'

import { artnetHost } from '../../config'
import { getUniverse } from '../../universe'

let server: Artnet

export async function initArtNetServer() {
  server = artnet({ host: artnetHost })

  server.set(Array.from(getUniverse()))
}

export function broadcastArtNetChannel(channel: number, value: number) {
  if (server === undefined) {
    return
  }
  server.set(channel, value)
}
