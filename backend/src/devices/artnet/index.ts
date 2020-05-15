import { Artnet } from 'artnet'

import { artnetHost, enableArtNetDevices } from '../../services/config'
import { getDmxUniverse } from '../../services/universe'
import { logTrace } from '../../util/log'
import { howLong } from '../../util/time'
import { deviceRegistry } from '../registry'

let server: Artnet

function broadcastUniverseChannel(channel: number, value: number) {
  if (!enableArtNetDevices || server === undefined) {
    return
  }
  logTrace('set ArtNet channel', channel, value)
  server.set(channel, value)
}

export async function init() {
  if (!enableArtNetDevices) {
    return
  }

  const start = Date.now()
  const artnet = require('artnet') // eslint-disable-line

  server = artnet({ host: artnetHost })
  server.set(Array.from(getDmxUniverse()))

  deviceRegistry.register({ broadcastUniverseChannel })

  howLong(start, 'initArtNetServer')
}
