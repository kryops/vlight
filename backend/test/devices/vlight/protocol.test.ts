/**
 * @jest-environment node
 */

import { universeSize } from '../../../src/config'
import {
  getBinaryChannelMessage,
  getBinaryUniverseMessage,
} from '../../../src/devices/vlight/protocol'

describe('devices/vlight/protocol', () => {
  it('getBinaryChannelMessage', () => {
    expect(getBinaryChannelMessage(1, 0)).toEqual(Buffer.from([0x00, 0x00]))
    expect(getBinaryChannelMessage(1, 1)).toEqual(Buffer.from([0x00, 0x01]))
    expect(getBinaryChannelMessage(1, 255)).toEqual(Buffer.from([0x00, 0xff]))
    expect(getBinaryChannelMessage(250, 250)).toEqual(Buffer.from([0xf9, 0xfa]))

    expect(getBinaryChannelMessage(251, 250)).toEqual(
      Buffer.from([0xfa, 0x00, 0xfa])
    )
    expect(getBinaryChannelMessage(500, 250)).toEqual(
      Buffer.from([0xfa, 0xf9, 0xfa])
    )

    expect(getBinaryChannelMessage(501, 250)).toEqual(
      Buffer.from([0xfb, 0x00, 0xfa])
    )
    expect(getBinaryChannelMessage(502, 250)).toEqual(
      Buffer.from([0xfb, 0x01, 0xfa])
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
