import { broadcastChannel } from '../devices/vlight'

const universe = Buffer.alloc(512)

export function getUniverse(): Buffer {
  return universe
}

export function setChannel(channel: number, value: number) {
  if (channel < 1 || channel > 512) {
    throw new Error(`invalid channel: ${channel}`)
  }
  universe[channel - 1] = value

  broadcastChannel(channel, value)
}
