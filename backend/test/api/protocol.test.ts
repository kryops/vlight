import { FixtureState } from '@vlight/entities'

import {
  getApiFixtureStateMessage,
  getApiMasterDataMessage,
  getApiStateMessage,
  getApiUniverseDeltaMessage,
  getApiUniverseMessage,
} from '../../src/api/protocol'
import { universeSize } from '../../src/config'

jest.mock('../../src/database', () => ({
  masterData: { foo: 'bar' },
}))

describe('api/protocol', () => {
  it('getApiStateMessage', () => {
    const universe = Buffer.alloc(universeSize)
    const channels = Buffer.alloc(universeSize)
    const fixtures = {
      '2': { on: true, channels: { r: 100 } },
    }
    const fixtureGroups = {
      '2': { on: true, channels: { r: 100 } },
    }
    const memories = {
      '2': { on: true, value: 100 },
    }
    expect(
      getApiStateMessage({
        universe,
        channels,
        fixtures,
        fixtureGroups,
        memories,
      })
    ).toEqual({
      type: 'state',
      masterData: { foo: 'bar' },
      universe: Array.from(universe),
      channels: Array.from(channels),
      fixtures,
      fixtureGroups,
      memories,
    })
  })

  it('getApiMasterDataMessage', () => {
    expect(getApiMasterDataMessage()).toEqual({
      type: 'masterdata',
      masterData: { foo: 'bar' },
    })
  })

  it('getApiUniverseMessage', () => {
    const universe = Buffer.alloc(universeSize)
    expect(getApiUniverseMessage(universe)).toEqual({
      type: 'universe',
      universe: Array.from(universe),
    })
  })

  it('getApiUniverseDeltaMessage', () => {
    const universe = Buffer.from([0, 1, 2, 3, 4])
    expect(getApiUniverseDeltaMessage(universe, [1, 3, 4])).toEqual({
      type: 'universe-delta',
      channels: {
        1: 0,
        3: 2,
        4: 3,
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
    expect(getApiFixtureStateMessage('1', state)).toEqual({
      type: 'fixture',
      id: '1',
      state,
    })
  })
})
