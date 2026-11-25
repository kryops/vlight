import { describe, expect, it } from 'vite-plus/test'

import {
  FixtureState,
  FixtureType,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { entityArrayToMap } from '@vlight/utils'

import { mapFixtureList } from '../src'
import {
  cleanFixtureState,
  getMasterDependentChannels,
  mapFixtureStateToChannels,
} from '../src/fixtures'

import { fixtures, fixtureTypes, fixtureGroups } from './mocks'

const masterData: MasterData = {
  fixtureTypes,
  fixtures,
  fixtureGroups,
  dynamicPages: [],
  memories: [],
  chaseColorPresets: [],
  memorySceneStatePresets: [],
  buttons: [],
  sequences: [],
  actions: [],
}

const masterDataMaps: MasterDataMaps = {
  fixtureTypes: entityArrayToMap(fixtureTypes),
  fixtures: entityArrayToMap(fixtures),
  fixtureGroups: entityArrayToMap(fixtureGroups),
  dynamicPages: new Map(),
  memories: new Map(),
  chaseColorPresets: new Map(),
  memorySceneStatePresets: new Map(),
  buttons: new Map(),
  sequences: new Map(),
  actions: new Map(),
}

describe('mapFixtureList', () => {
  it.each<[string, string[], string[]]>([
    ['just returns fixtures', ['foo1'], ['foo1']],
    ['maps counted fixtures', ['all:bar'], ['bar1', 'bar2']],
    ['maps fixtures by type', ['type:foo'], ['foo1', 'foo2']],
    ['maps fixtures by group', ['group:group1'], ['baz1']],
    ['maps each fixture only once', ['foo1', 'foo1'], ['foo1']],
    [
      'all of the above',
      ['foo1', 'all:bar', 'type:bar'],
      ['foo1', 'bar1', 'bar2'],
    ],
    ['skips mapping for non-existent types', ['type:none'], []],
    ['skips mapping for non-existent groups', ['group:none'], []],
    ['skips mapping for non-existent counted fixture IDs', ['all:none'], []],
    ['skips mapping for non-existent fixtures', ['none'], []],
  ])('%s', (_, input, expected) => {
    expect(mapFixtureList(input, { masterData, masterDataMaps })).toEqual(
      expected
    )
  })
})

describe('mapFixtureStateToChannels', () => {
  const fixtureTypeWithMaster: FixtureType = {
    id: '1',
    name: 'foo',
    mapping: ['r', 'g', 'b', 'm'],
  }
  const fixtureTypeWithoutMaster: FixtureType = {
    id: '2',
    name: 'bar',
    mapping: ['r', 'g', 'b', 'a'],
  }
  const fixtureTypeWithCustomDependentChannels: FixtureType = {
    id: '3',
    name: 'baz',
    mapping: ['r', 'g', 'pan'],
    masterDependentChannels: ['g', 'pan'],
  }

  const exampleState: FixtureState = {
    on: true,
    channels: {
      r: 100,
      g: 150,
      m: 200,
    },
  }

  const turnedOff: FixtureState = {
    on: false,
    channels: {
      r: 100,
    },
  }

  it.each<[string, FixtureType, FixtureState, number[]]>([
    [
      'turned off (with master)',
      fixtureTypeWithMaster,
      turnedOff,
      [0, 0, 0, 0],
    ],
    [
      'turned off (without master)',
      fixtureTypeWithoutMaster,
      turnedOff,
      [0, 0, 0, 0],
    ],
    [
      'example state (with master)',
      fixtureTypeWithMaster,
      exampleState,
      [100, 150, 0, 200],
    ],
    [
      'example state (without master)',
      fixtureTypeWithoutMaster,
      exampleState,
      [78, 118, 0, 0],
    ],
    [
      'custom master-dependent channels',
      fixtureTypeWithCustomDependentChannels,
      { on: true, channels: { r: 100, g: 150, pan: 100, m: 102 } },
      [100, 60, 40],
    ],
  ])('%p', (_, fixtureType, state, expected) => {
    expect(mapFixtureStateToChannels(fixtureType, state)).toEqual(expected)
  })
})

describe('getMasterDependentChannels', () => {
  it('defaults to the color channels', () => {
    expect(
      getMasterDependentChannels({ id: '1', name: 'foo', mapping: ['r'] })
    ).toEqual(new Set(['r', 'g', 'b', 'w', 'a', 'uv']))
  })

  it('defaults to all channels for fixtures without master and color channels', () => {
    expect(
      getMasterDependentChannels({
        id: '1',
        name: 'foo',
        mapping: ['int', 'x'],
      })
    ).toEqual(new Set(['int', 'x']))
  })

  it('does not fall back to all channels for fixtures with a master', () => {
    expect(
      getMasterDependentChannels({ id: '1', name: 'foo', mapping: ['m', 'x'] })
    ).toEqual(new Set(['r', 'g', 'b', 'w', 'a', 'uv']))
  })

  it('allows configuring no channels', () => {
    expect(
      getMasterDependentChannels({
        id: '1',
        name: 'foo',
        mapping: ['int'],
        masterDependentChannels: [],
      })
    ).toEqual(new Set())
  })

  it('uses the configured channels without the master', () => {
    expect(
      getMasterDependentChannels({
        id: '1',
        name: 'foo',
        mapping: ['r', 'pan'],
        masterDependentChannels: ['m', 'pan'],
      })
    ).toEqual(new Set(['pan']))
  })
})

describe('cleanFixtureState', () => {
  it('removes channels not in the mapping, but keeps the (virtual) master', () => {
    expect(
      cleanFixtureState({ on: true, channels: { m: 100, r: 1, x: 2 } }, ['r'])
    ).toEqual({ on: true, channels: { m: 100, r: 1 } })
  })
})
