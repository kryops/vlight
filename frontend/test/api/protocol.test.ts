import { FixtureState, MemoryState } from '@vlight/entities'

import {
  getApiChannelMessage,
  getApiFixtureStateMessage,
  getApiFixtureGroupStateMessage,
  getApiMemoryStateMessage,
} from '../../src/api/protocol'

describe('api/protocol', () => {
  it('getApiChannelMessage', () => {
    expect(getApiChannelMessage([1], 2)).toEqual({
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
    expect(getApiFixtureStateMessage('id', state, false)).toEqual({
      type: 'fixture',
      id: 'id',
      state,
      merge: false,
    })
  })

  it('getApiFixtureGroupStateMessage', () => {
    const state: FixtureState = {
      on: true,
      channels: {
        r: 100,
      },
    }
    expect(getApiFixtureGroupStateMessage('id', state, false)).toEqual({
      type: 'fixture-group',
      id: 'id',
      state,
      merge: false,
    })
  })

  it('getApiMemoryStateMessage', () => {
    const state: MemoryState = {
      on: true,
      value: 255,
    }
    expect(getApiMemoryStateMessage('id', state, false)).toEqual({
      type: 'memory',
      id: 'id',
      state,
      merge: false,
    })
  })
})
