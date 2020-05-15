/**
 * @jest-environment node
 */

import { broadcastUniverseChannelToApiClients } from '../../src/services/api'
import { universeSize } from '../../src/services/config'
import {
  channelUniverse,
  init as initChannels,
} from '../../src/controls/channels'
import { broadcastUniverseChannelToDevices } from '../../src/devices'
import { getDmxUniverse, setUniverseChannel } from '../../src/services/universe'

jest.mock('../../src/devices')
jest.mock('../../src/services/api')

describe('services/universe', () => {
  beforeAll(() => initChannels())

  it('changes values', () => {
    const mockUniverse = Buffer.alloc(universeSize)
    expect(getDmxUniverse()).toEqual(mockUniverse)

    // higher value
    setUniverseChannel(channelUniverse, 1, 255)
    mockUniverse[0] = 255
    expect(getDmxUniverse()).toEqual(mockUniverse)

    expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 255)
    expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)

    // lower value
    setUniverseChannel(channelUniverse, 1, 200)
    mockUniverse[0] = 200
    expect(getDmxUniverse()).toEqual(mockUniverse)
    expect(broadcastUniverseChannelToDevices).toHaveBeenLastCalledWith(1, 200)
    expect(broadcastUniverseChannelToApiClients).toHaveBeenLastCalledWith(1)

    // same value
    setUniverseChannel(channelUniverse, 1, 200)
    expect(getDmxUniverse()).toEqual(mockUniverse)
    expect(broadcastUniverseChannelToDevices).toHaveBeenCalledTimes(2)
    expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledTimes(2)
  })

  it('throws on invalid channels', () => {
    expect(() => setUniverseChannel(channelUniverse, -1, 0)).toThrowError()
    expect(() => setUniverseChannel(channelUniverse, 0, 0)).toThrowError()
    expect(() =>
      setUniverseChannel(channelUniverse, universeSize + 1, 0)
    ).toThrowError()
  })
})
