import { FixtureState } from '@vlight/entities'

import {
  getApiChannelMessage,
  getApiFixtureStateMessage,
} from '../../src/api/protocol'

describe('api/protocol', () => {
  it('getApiChannelMessage', () => {
    expect(getApiChannelMessage(1, 2)).toEqual({
      type: 'channels',
      channels: {
        1: 2,
      },
    })
  })

  it('getApiFixtureStateMessage', () => {
    const state: FixtureState = {
      on: true,
      channels: {
        r: 100,
      },
    }
    expect(getApiFixtureStateMessage('id', state)).toEqual({
      type: 'fixture',
      id: 'id',
      state,
    })
  })
})
