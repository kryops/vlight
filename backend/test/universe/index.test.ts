/**
 * @jest-environment node
 */

import { broadcastChannel } from '../../src/devices/vlight'
import { getUniverse, setChannel } from '../../src/universe'

jest.mock('../../src/devices/vlight')

describe('universe/index', () => {
  it('changes values', () => {
    const mockUniverse = Buffer.alloc(512)
    expect(getUniverse()).toEqual(mockUniverse)
    setChannel(1, 255)
    mockUniverse[0] = 255
    expect(getUniverse()).toEqual(mockUniverse)

    expect(broadcastChannel).toHaveBeenCalledTimes(1)
  })

  it('throws on invalid channels', () => {
    expect(() => setChannel(-1, 0)).toThrowError()
    expect(() => setChannel(513, 0)).toThrowError()
  })
})
