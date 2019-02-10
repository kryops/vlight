import { handleApiMessage } from '../../src/api'
import { channelUniverse, setUniverseChannel } from '../../src/universe'

jest.mock('../../src/universe')

describe('api/index', () => {
  it('handleApiMessage', () => {
    handleApiMessage({ type: 'channels', channels: { 1: 200 } })
    expect(setUniverseChannel).toHaveBeenCalledWith(channelUniverse, 1, 200)
  })
})
