import {
  getApiChannelMessage,
  getApiUniverseMessage,
} from '../../src/api/protocol'
import { universeSize } from '../../src/config'

describe('api/protocol', () => {
  it('getApiChannelMessage', () => {
    expect(getApiChannelMessage(1, 200)).toEqual({
      type: 'channel',
      channel: 1,
      value: 200,
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
