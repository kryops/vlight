import { broadcastChannelToDevices } from '../../../src/devices/vlight'
import { sendTcpBroadcastMessage } from '../../../src/devices/vlight/tcp'
import { sendUdpMulticastMessage } from '../../../src/devices/vlight/udp'

jest.mock('../../../src/devices/vlight/tcp')
jest.mock('../../../src/devices/vlight/udp')

describe('devices/vlight/index', () => {
  it('broadcastChannel', () => {
    const message = Buffer.from([0x01, 0x02])
    broadcastChannelToDevices(2, 2)
    expect(sendUdpMulticastMessage).toHaveBeenCalledWith(message)
    expect(sendTcpBroadcastMessage).toHaveBeenCalledWith(message)
  })
})
