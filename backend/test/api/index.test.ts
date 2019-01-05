import { handleApiMessage } from '../../src/api'
import { setChannel } from '../../src/universe'

jest.mock('../../src/universe')

describe('api/index', () => {
  it('handleApiMessage', () => {
    handleApiMessage({ type: 'channels', channels: { 1: 200 } })
    expect(setChannel).toHaveBeenCalledWith(1, 200)
  })
})
