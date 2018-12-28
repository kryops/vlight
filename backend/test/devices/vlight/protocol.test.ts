/**
 * @jest-environment node
 */

import {
  getChannelMessage,
  getUniverseMessage,
} from '../../../src/devices/vlight/protocol'

describe('devices/vlight/protocol', () => {
  it('getChannelMessage', () => {
    expect(getChannelMessage(1, 0)).toEqual(Buffer.from([0x00, 0x00]))
    expect(getChannelMessage(1, 1)).toEqual(Buffer.from([0x00, 0x01]))
    expect(getChannelMessage(1, 255)).toEqual(Buffer.from([0x00, 0xff]))
    expect(getChannelMessage(250, 250)).toEqual(Buffer.from([0xf9, 0xfa]))

    expect(getChannelMessage(251, 250)).toEqual(Buffer.from([0xfa, 0x00, 0xfa]))
    expect(getChannelMessage(500, 250)).toEqual(Buffer.from([0xfa, 0xf9, 0xfa]))

    expect(getChannelMessage(501, 250)).toEqual(Buffer.from([0xfb, 0x00, 0xfa]))
    expect(getChannelMessage(502, 250)).toEqual(Buffer.from([0xfb, 0x01, 0xfa]))
  })

  it('getUniverseMessage', () => {
    const universe = Buffer.alloc(512, 2)
    const universeMessage = Buffer.concat([new Uint8Array([0xff]), universe])
    expect(getUniverseMessage(universe)).toEqual(universeMessage)

    const largeUniverse = Buffer.alloc(514, 2)
    expect(getUniverseMessage(largeUniverse)).toEqual(universeMessage)

    const smallUniverse = Buffer.alloc(510, 2)
    const smallUniverseMessage = universeMessage.slice()
    smallUniverseMessage[511] = 0
    smallUniverseMessage[512] = 0
    expect(getUniverseMessage(smallUniverse)).toEqual(universeMessage)
  })
})
