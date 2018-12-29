import { handleApiMessage } from '../../src/api'
import { setChannel } from '../../src/universe'

jest.mock('../../src/universe')

describe('api/index', () => {
  it('handleApiMessage', () => {
    handleApiMessage({ type: 'channel', channel: 1, value: 200 })
    expect(setChannel).toHaveBeenCalledWith(1, 200)
  })
})
