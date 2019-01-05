import { broadcastUniverseChannelToDevices } from '../../src/devices'
import { broadcastArtNetChannel } from '../../src/devices/artnet'
import { setChannelChanged } from '../../src/devices/vlight'

jest.mock('../../src/devices/artnet/index')
jest.mock('../../src/devices/vlight/index')

describe('devices/index', () => {
  it('broadcastChannel', () => {
    broadcastUniverseChannelToDevices(2, 2)
    expect(setChannelChanged).toHaveBeenCalledWith(2)
    expect(broadcastArtNetChannel).toHaveBeenCalledWith(2, 2)
  })
})
