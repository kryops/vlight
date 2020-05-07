/**
 * @jest-environment node
 */

import { universeSize } from '../../../src/services/config'
import {
  getBinaryChannelMessage,
  getBinaryUniverseMessage,
  getMultipleBinaryChannelMessages,
} from '../../../src/devices/vlight/protocol'

describe('devices/vlight/protocol', () => {
  describe('getBinaryChannelMessage', () => {
    it.each<[number, number, number[]]>([
      [1, 0, [0x00, 0x00]],
      [1, 1, [0x00, 0x01]],
      [1, 255, [0x00, 0xff]],
      [250, 250, [0xf9, 0xfa]],
      [251, 250, [0xfa, 0x00, 0xfa]],
      [500, 250, [0xfa, 0xf9, 0xfa]],
      [501, 250, [0xfb, 0x00, 0xfa]],
      [502, 250, [0xfb, 0x01, 0xfa]],
    ])('channel %p value %p => %p', (channel, value, expected) => {
      expect(getBinaryChannelMessage(channel, value)).toEqual(
        Buffer.from(expected)
      )
    })
  })

  it('getMultipleBinaryChannelMessages', () => {
    const universe = Buffer.from([0, 1, 2, 3])
    const channels = [1, 3, 4]
    const message = Buffer.from([0x00, 0x00, 0x02, 0x02, 0x03, 0x03])
    expect(getMultipleBinaryChannelMessages(universe, channels)).toEqual(
      message
    )
  })

  it('getBinaryUniverseMessage', () => {
    const universe = Buffer.alloc(universeSize, 2)
    const universeMessage = Buffer.concat([new Uint8Array([0xff]), universe])
    expect(getBinaryUniverseMessage(universe)).toEqual(universeMessage)

    const largeUniverse = Buffer.alloc(universeSize + 2, 2)
    expect(getBinaryUniverseMessage(largeUniverse)).toEqual(universeMessage)

    const smallUniverse = Buffer.alloc(universeSize - 2, 2)
    const smallUniverseMessage = universeMessage.slice()
    smallUniverseMessage[universeSize - 1] = 0
    smallUniverseMessage[universeSize] = 0
    expect(getBinaryUniverseMessage(smallUniverse)).toEqual(universeMessage)
  })
})
