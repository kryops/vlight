import { describe, expect, it } from 'vite-plus/test'

import { FixtureChannelState, FixtureType, MasterData } from '@vlight/types'
import { entityArrayToMap } from '@vlight/utils'

import {
  formatChannelStates,
  getChannelStateName,
  getChannelStateNames,
  getCommonChannelStates,
  parseChannelStates,
} from '../src/channel-states'

const wheelA: FixtureChannelState[] = [
  { value: 0, name: 'Open' },
  { value: 8, name: 'Red' },
  { value: 16, name: 'Blue' },
]

const wheelB: FixtureChannelState[] = [
  { value: 0, name: 'Open' },
  { value: 10, name: 'Green' },
]

describe('getChannelStateName', () => {
  it.each<[number, string | undefined]>([
    [0, 'Open'],
    [7, 'Open'],
    [8, 'Red'],
    [15, 'Red'],
    [16, 'Blue'],
    [255, 'Blue'],
  ])('value %d => %s', (value, expected) => {
    expect(getChannelStateName(wheelA, value)).toBe(expected)
  })

  it('returns undefined below the first state', () => {
    expect(getChannelStateName([{ value: 10, name: 'X' }], 5)).toBeUndefined()
  })
})

describe('getChannelStateNames', () => {
  it('returns a single name if all tables agree', () => {
    expect(getChannelStateNames([wheelA, wheelB], 5)).toEqual(['Open'])
  })

  it('returns all names if the tables differ', () => {
    expect(getChannelStateNames([wheelA, wheelB], 12)).toEqual(['Red', 'Green'])
  })

  it('ignores tables without a matching state', () => {
    expect(
      getChannelStateNames([wheelA, [{ value: 100, name: 'X' }]], 12)
    ).toEqual(['Red'])
  })
})

describe('getCommonChannelStates', () => {
  const fixtureTypes: FixtureType[] = [
    {
      id: 'a',
      name: 'A',
      mapping: ['color'],
      channelStates: { color: wheelA },
    },
    {
      id: 'b',
      name: 'B',
      mapping: ['color'],
      channelStates: { color: wheelB },
    },
    { id: 'c', name: 'C', mapping: ['color'] },
  ]
  const masterData = {
    fixtureTypes,
    fixtures: [
      { id: 'a1', type: 'a', channel: 1 },
      { id: 'a2', type: 'a', channel: 2 },
      { id: 'b1', type: 'b', channel: 3 },
      { id: 'c1', type: 'c', channel: 4 },
    ],
    fixtureGroups: [],
  } as unknown as MasterData
  const masterDataMaps = {
    fixtureTypes: entityArrayToMap(masterData.fixtureTypes),
    fixtures: entityArrayToMap(masterData.fixtures),
    fixtureGroups: new Map(),
  } as any

  it('collects one table per fixture type', () => {
    expect(
      getCommonChannelStates(['a1', 'a2', 'b1', 'c1'], {
        masterData,
        masterDataMaps,
      })
    ).toEqual({ color: [wheelA, wheelB] })
  })

  it('returns nothing for fixture types without states', () => {
    expect(
      getCommonChannelStates(['c1'], { masterData, masterDataMaps })
    ).toEqual({})
  })
})

describe('parseChannelStates', () => {
  it('parses, sorts and ignores invalid lines', () => {
    expect(
      parseChannelStates('16 Blue\n\n0 Open\nfoo\n  8-15  Light red \n300 X')
    ).toEqual([
      { value: 0, name: 'Open' },
      { value: 8, name: 'Light red' },
      { value: 16, name: 'Blue' },
    ])
  })

  it('round-trips with formatChannelStates', () => {
    expect(parseChannelStates(formatChannelStates(wheelA))).toEqual(wheelA)
  })
})
