/**
 * @jest-environment node
 */

import { universeSize } from '../../../src/services/config'
import {
  getChannelBlockMessage,
  getModeMessage,
} from '../../../src/devices/usbdmx/protocol'

describe('devices/usbdmx/protocol', () => {
  it('getModeMessage', () => {
    expect(getModeMessage()).toMatchSnapshot()
  })

  it('getChannelBlockMessage', () => {
    const universe = Buffer.alloc(universeSize)
    for (let i = 0; i < universeSize; i++) {
      universe[i] = i
    }
    expect(getChannelBlockMessage(universe, 0)).toMatchSnapshot()
    expect(getChannelBlockMessage(universe, 1)).toMatchSnapshot()
  })
})
