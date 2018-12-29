import { universeSize } from '../../config'

const universePrefix = new Uint8Array([0xff])

export function getBinaryChannelMessage(
  channel: number,
  value: number
): Buffer {
  if (channel <= 250) {
    return Buffer.from([channel - 1, value])
  }
  if (channel <= 500) {
    return Buffer.from([0xfa, channel - 251, value])
  }
  return Buffer.from([0xfb, channel - 501, value])
}

export function getBinaryUniverseMessage(universe: Buffer): Buffer {
  if (universe.length === universeSize) {
    return Buffer.concat([universePrefix, universe], universeSize + 1)
  }
  const fixedLengthMessage = Buffer.alloc(universeSize + 1)
  fixedLengthMessage[0] = 0xff
  universe.copy(fixedLengthMessage, 1, 0)
  return fixedLengthMessage
}
