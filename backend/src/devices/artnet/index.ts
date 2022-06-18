import { Artnet } from 'artnet'
import { logger } from '@vlight/utils'

import { artnetHost, enableArtNetDevices } from '../../services/config'
import { getDmxUniverse } from '../../services/universe'
import { howLong } from '../../util/time'
import { deviceRegistry } from '../registry'

let server: Artnet

function broadcastUniverseChannel(channel: number, value: number) {
  if (!enableArtNetDevices || server === undefined) {
    return
  }
  logger.trace('set ArtNet channel', channel, value)
  server.set(channel, value)
}

export async function init(): Promise<void> {
  if (!enableArtNetDevices) {
    return
  }

  const start = Date.now()

  // using require() so we only actually load the module if ArtNet is turned on
  const artnet = require('artnet') // eslint-disable-line

  server = artnet({ host: artnetHost })
  server.set(Array.from(getDmxUniverse()))

  deviceRegistry.register({ broadcastUniverseChannel })

  howLong(start, 'initArtNetServer')
}
