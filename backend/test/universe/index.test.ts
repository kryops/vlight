/**
 * @jest-environment node
 */

import { broadcastUniverseChannelToSockets } from '../../src/api'
import { universeSize } from '../../src/config'
import { broadcastUniverseChannelToDevices } from '../../src/devices'
import { getDmxUniverse, setChannel } from '../../src/universe'

jest.mock('../../src/devices')
jest.mock('../../src/api')

describe('universe/index', () => {
  it('changes values', () => {
    const mockUniverse = Buffer.alloc(universeSize)
    expect(getDmxUniverse()).toEqual(mockUniverse)

    // higher value
    setChannel(1, 255)
    mockUniverse[0] = 255
    expect(getDmxUniverse()).toEqual(mockUniverse)

    expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 255)
    expect(broadcastUniverseChannelToSockets).toHaveBeenCalledWith(1)

    // lower value
    setChannel(1, 200)
    mockUniverse[0] = 200
    expect(getDmxUniverse()).toEqual(mockUniverse)
    expect(broadcastUniverseChannelToDevices).toHaveBeenLastCalledWith(1, 200)
    expect(broadcastUniverseChannelToSockets).toHaveBeenLastCalledWith(1)

    // same value
    setChannel(1, 200)
    expect(broadcastUniverseChannelToDevices).toHaveBeenCalledTimes(2)
    expect(broadcastUniverseChannelToSockets).toHaveBeenCalledTimes(2)
  })

  it('throws on invalid channels', () => {
    expect(() => setChannel(-1, 0)).toThrowError()
    expect(() => setChannel(universeSize + 1, 0)).toThrowError()
  })
})
