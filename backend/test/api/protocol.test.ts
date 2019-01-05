import {
  getApiStateMessage,
  getApiUniverseDeltaMessage,
  getApiUniverseMessage,
} from '../../src/api/protocol'
import { universeSize } from '../../src/config'

describe('api/protocol', () => {
  it('getApiStateMessage', () => {
    const universe = Buffer.alloc(universeSize)
    const channels = Buffer.alloc(universeSize)
    expect(getApiStateMessage(universe, channels)).toEqual({
      type: 'state',
      universe: Array.from(universe),
      channels: Array.from(channels),
    })
  })

  it('getApiUniverseMessage', () => {
    const universe = Buffer.alloc(universeSize)
    expect(getApiUniverseMessage(universe)).toEqual({
      type: 'universe',
      universe: Array.from(universe),
    })
  })

  it('getApiUniverseDeltaMessage', () => {
    const universe = Buffer.from([0, 1, 2, 3, 4])
    expect(getApiUniverseDeltaMessage(universe, [1, 3, 4])).toEqual({
      type: 'universe-delta',
      channels: {
        1: 0,
        3: 2,
        4: 3,
      },
    })
  })
})
