/**
 * @jest-environment node
 */

import { broadcastChannelToSockets } from '../../src/api'
import { universeSize } from '../../src/config'
import { broadcastChannelToDevices } from '../../src/devices'
import { getUniverse, setChannel } from '../../src/universe'

jest.mock('../../src/devices')
jest.mock('../../src/api')

describe('universe/index', () => {
  it('changes values', () => {
    const mockUniverse = Buffer.alloc(universeSize)
    expect(getUniverse()).toEqual(mockUniverse)
    setChannel(1, 255)
    mockUniverse[0] = 255
    expect(getUniverse()).toEqual(mockUniverse)

    expect(broadcastChannelToDevices).toHaveBeenCalledWith(1, 255)
    expect(broadcastChannelToSockets).toHaveBeenCalledWith(1)
  })

  it('throws on invalid channels', () => {
    expect(() => setChannel(-1, 0)).toThrowError()
    expect(() => setChannel(universeSize + 1, 0)).toThrowError()
  })
})
