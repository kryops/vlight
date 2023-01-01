/**
 * @jest-environment node
 */

import { broadcastUniverseChannelToApiClients } from '../../src/services/api'
import { universeSize } from '../../src/services/config'
import { broadcastUniverseChannelToDevices } from '../../src/devices'
import {
  addUniverse,
  createUniverse,
  getDmxUniverse,
  setUniverseChannel,
} from '../../src/services/universe'

jest.mock('../../src/devices')
jest.mock('../../src/services/api')

describe('services/universe', () => {
  const myUniverse = createUniverse()

  beforeAll(() => {
    addUniverse(myUniverse)
  })

  it('changes values', () => {
    const mockUniverse = Buffer.alloc(universeSize)
    expect(getDmxUniverse()).toEqual(mockUniverse)

    // higher value
    setUniverseChannel(myUniverse, 1, 255)
    mockUniverse[0] = 255
    expect(getDmxUniverse()).toEqual(mockUniverse)

    expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 255)
    expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)

    // lower value
    setUniverseChannel(myUniverse, 1, 200)
    mockUniverse[0] = 200
    expect(getDmxUniverse()).toEqual(mockUniverse)
    expect(broadcastUniverseChannelToDevices).toHaveBeenLastCalledWith(1, 200)
    expect(broadcastUniverseChannelToApiClients).toHaveBeenLastCalledWith(1)

    // same value
    setUniverseChannel(myUniverse, 1, 200)
    expect(getDmxUniverse()).toEqual(mockUniverse)
    expect(broadcastUniverseChannelToDevices).toHaveBeenCalledTimes(2)
    expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledTimes(2)
  })

  it('throws on invalid channels', () => {
    expect(() => setUniverseChannel(myUniverse, -1, 0)).toThrow()
    expect(() => setUniverseChannel(myUniverse, 0, 0)).toThrow()
    expect(() => setUniverseChannel(myUniverse, universeSize + 1, 0)).toThrow()
  })
})
