import { handleApiMessage } from '../../src/api'
import { channelUniverse } from '../../src/controls/channels'
import { setUniverseChannel } from '../../src/services/universe'

jest.mock('../../src/services/universe')

describe('api/index', () => {
  it('handleApiMessage', () => {
    handleApiMessage({ type: 'channels', channels: { 1: 200 } })
    expect(setUniverseChannel).toHaveBeenCalledWith(channelUniverse, 1, 200)
  })
})
