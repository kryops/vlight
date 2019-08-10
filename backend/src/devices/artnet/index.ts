import { Artnet } from 'artnet'

import { artnetHost, enableArtNetDevices } from '../../config'
import { getDmxUniverse } from '../../universe'
import { logTrace } from '../../util/log'
import { howLong } from '../../util/time'

let server: Artnet

export async function initArtNetServer() {
  if (!enableArtNetDevices) {
    return
  }

  const start = Date.now()
  const artnet = require('artnet') // eslint-disable-line

  server = artnet({ host: artnetHost })

  server.set(Array.from(getDmxUniverse()))
  howLong(start, 'initArtNetServer')
}

export function broadcastArtNetChannel(channel: number, value: number) {
  if (!enableArtNetDevices || server === undefined) {
    return
  }
  logTrace('set ArtNet channel', channel, value)
  server.set(channel, value)
}
