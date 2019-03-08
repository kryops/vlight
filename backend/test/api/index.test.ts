import { handleApiMessage } from '../../src/api'
import { setUniverseChannel } from '../../src/universe'
import { channelUniverse } from '../../src/universe/channels'

jest.mock('../../src/universe')

describe('api/index', () => {
  it('handleApiMessage', () => {
    handleApiMessage({ type: 'channels', channels: { 1: 200 } })
    expect(setUniverseChannel).toHaveBeenCalledWith(channelUniverse, 1, 200)
  })
})
