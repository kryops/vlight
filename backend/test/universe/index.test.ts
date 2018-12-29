/**
 * @jest-environment node
 */

import { broadcastToSockets } from '../../src/api/websocket'
import { universeSize } from '../../src/config'
import { broadcastChannelToDevices } from '../../src/devices/vlight'
import { getUniverse, setChannel } from '../../src/universe'

jest.mock('../../src/devices/vlight')
jest.mock('../../src/api/websocket')

describe('universe/index', () => {
  it('changes values', () => {
    const mockUniverse = Buffer.alloc(universeSize)
    expect(getUniverse()).toEqual(mockUniverse)
    setChannel(1, 255)
    mockUniverse[0] = 255
    expect(getUniverse()).toEqual(mockUniverse)

    expect(broadcastChannelToDevices).toHaveBeenCalledWith(1, 255)
    expect(broadcastToSockets).toHaveBeenCalledWith({
      type: 'channel',
      channel: 1,
      value: 255,
    })
  })

  it('throws on invalid channels', () => {
    expect(() => setChannel(-1, 0)).toThrowError()
    expect(() => setChannel(universeSize + 1, 0)).toThrowError()
  })
})
