import {
  getApiChannelsMessage,
  getApiUniverseMessage,
} from '../../src/api/protocol'
import { universeSize } from '../../src/config'

describe('api/protocol', () => {
  it('getApiChannelsMessage', () => {
    const universe = Buffer.from([0, 1, 2, 3, 4])
    expect(getApiChannelsMessage(universe, [1, 3, 4])).toEqual({
      type: 'channels',
      channels: {
        1: 0,
        3: 2,
        4: 3,
      },
    })
  })

  it('getApiUniverseMessage', () => {
    const universe = Buffer.alloc(universeSize)
    expect(getApiUniverseMessage(universe)).toEqual({
      type: 'universe',
      universe: Array.from(universe),
    })
  })
})
