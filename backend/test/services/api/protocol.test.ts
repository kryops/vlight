import {
  Dictionary,
  FixtureState,
  LiveChase,
  LiveMemory,
  MasterData,
  MemoryState,
} from '@vlight/types'

import {
  getApiFixtureStateMessage,
  getApiMasterDataMessage,
  getApiStateMessage,
  getApiUniverseDeltaMessage,
  getApiUniverseMessage,
} from '../../../src/services/api/protocol'
import { universeSize } from '../../../src/services/config'

function getMasterDataMock(): MasterData {
  return {
    dynamicPages: [],
    fixtureGroups: [],
    fixtureTypes: [],
    fixtures: [],
    memories: [],
    chaseColorPresets: [],
  }
}

describe('api/protocol', () => {
  it('getApiStateMessage', () => {
    const universe = Buffer.alloc(universeSize)
    const channels = Buffer.alloc(universeSize)
    const fixtures: Dictionary<FixtureState> = {
      '2': { on: true, channels: { r: 100 } },
    }
    const fixtureGroups: Dictionary<FixtureState> = {
      '2': { on: true, channels: { r: 100 } },
    }
    const memories: Dictionary<MemoryState> = {
      '2': { on: true, value: 100 },
    }
    const liveMemories: Dictionary<LiveMemory> = {
      '2': { on: true, value: 100, members: [], states: [] },
    }
    const liveChases: Dictionary<LiveChase> = {
      '2': {
        on: true,
        stopped: false,
        value: 100,
        members: [],
        colors: [],
        speed: 0,
        light: 1,
      },
    }
    expect(
      getApiStateMessage({
        masterData: getMasterDataMock(),
        rawMasterData: getMasterDataMock(),
        universe,
        channels,
        fixtures,
        fixtureGroups,
        memories,
        liveMemories,
        liveChases,
        dmxMaster: 255,
        dmxMasterFade: 1,
      })
    ).toEqual({
      type: 'state',
      masterData: getMasterDataMock(),
      rawMasterData: getMasterDataMock(),
      universe: Array.from(universe),
      channels: Array.from(channels),
      fixtures,
      fixtureGroups,
      memories,
      liveMemories,
      liveChases,
      dmxMaster: 255,
      dmxMasterFade: 1,
    })
  })

  it('getApiMasterDataMessage', () => {
    expect(
      getApiMasterDataMessage({
        masterData: getMasterDataMock(),
        rawMasterData: getMasterDataMock(),
      })
    ).toEqual({
      type: 'masterdata',
      masterData: getMasterDataMock(),
      rawMasterData: getMasterDataMock(),
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
