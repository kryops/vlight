import { getApiChannelMessage } from '../api/protocol'
import { broadcastToSockets } from '../api/websocket'
import { universeSize } from '../config'
import { broadcastChannelToDevices } from '../devices/vlight'

const universe = Buffer.alloc(universeSize)

function assertValidChannel(channel: number) {
  if (channel < 1 || channel > universeSize) {
    throw new Error(`invalid channel: ${channel}`)
  }
}

export function getUniverse(): Buffer {
  return universe
}

export function setChannel(channel: number, value: number) {
  assertValidChannel(channel)

  universe[channel - 1] = value

  broadcastChannelToDevices(channel, value)
  broadcastToSockets(getApiChannelMessage(channel, value))
}
