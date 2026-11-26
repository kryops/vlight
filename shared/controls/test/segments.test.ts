import { describe, expect, it } from 'vite-plus/test'

import {
  Dictionary,
  Fixture,
  FixtureState,
  FixtureType,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { entityArrayToMap } from '@vlight/utils'

import {
  getFixtureTypeSegments,
  getMemberFixture,
  getSegmentFixtureType,
  mapFixtureList,
  mapFixtureMemberList,
  parseSegmentMemberId,
  toggleFixtureMappingSegments,
  writeFixtureStatesToUniverse,
} from '../src'

const barType: FixtureType = {
  id: 'bar',
  name: 'Bar',
  mapping: ['eff', 'm', 'r', 'g', 'b', 'r', 'g', 'b', 'r', 'g', 'b'],
  shape: 'square',
  xSize: 9,
  ySize: 3,
}

const noMasterType: FixtureType = {
  id: 'nomaster',
  name: 'No Master',
  mapping: ['r', 'r'],
}

const segmentMasterType: FixtureType = {
  id: 'segmentmaster',
  name: 'Segment Master',
  mapping: ['str', 'r', 'm', 'r', 'm'],
}

const parType: FixtureType = {
  id: 'par',
  name: 'Par',
  mapping: ['m', 'r', 'g', 'b'],
}

const fixtureTypes = [barType, noMasterType, segmentMasterType, parType]

const fixtures: Fixture[] = [
  { id: 'bar1', type: 'bar', channel: 1, x: 50, y: 50 },
  { id: 'par1', type: 'par', channel: 20, x: 10, y: 10 },
  { id: 'nm1', type: 'nomaster', channel: 30 },
  { id: 'sm1', type: 'segmentmaster', channel: 35 },
]

const masterData: MasterData = {
  fixtureTypes,
  fixtures,
  fixtureGroups: [{ id: 'g', fixtures: ['bar1', 'par1'] }],
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
  fixtureGroups: entityArrayToMap(masterData.fixtureGroups),
  dynamicPages: new Map(),
  memories: new Map(),
  chaseColorPresets: new Map(),
  memorySceneStatePresets: new Map(),
  buttons: new Map(),
  sequences: new Map(),
  actions: new Map(),
}

const masterDataWithMaps = { masterData, masterDataMaps }

describe('getFixtureTypeSegments', () => {
  it('detects repeated channels as segments', () => {
    expect(getFixtureTypeSegments(barType)).toEqual({
      count: 3,
      segmentByMappingIndex: [undefined, undefined, 0, 0, 0, 1, 1, 1, 2, 2, 2],
      masterPerSegment: false,
      masterIndexBySegment: [1, 1, 1],
    })
  })

  it('detects a master channel per segment', () => {
    expect(getFixtureTypeSegments(segmentMasterType)).toEqual({
      count: 2,
      segmentByMappingIndex: [undefined, 0, 0, 1, 1],
      masterPerSegment: true,
      masterIndexBySegment: [2, 4],
    })
  })

  it('splits dimmer packs by their master channels', () => {
    expect(
      getFixtureTypeSegments({ id: 'x', name: 'x', mapping: ['m', 'm', 'm'] })
    ).toMatchObject({ count: 3, masterPerSegment: true })
  })

  it('shares master channels that do not appear once per segment', () => {
    expect(
      getFixtureTypeSegments({
        id: 'x',
        name: 'x',
        mapping: ['m', 'm', 'r', 'r', 'r'],
      })
    ).toMatchObject({
      count: 3,
      segmentByMappingIndex: [undefined, undefined, 0, 1, 2],
      masterPerSegment: false,
    })
  })

  it('supports grouped channel layouts', () => {
    expect(
      getFixtureTypeSegments({
        id: 'x',
        name: 'x',
        mapping: ['r', 'r', 'g', 'g', 'str'],
      })?.segmentByMappingIndex
    ).toEqual([0, 1, 0, 1, undefined])
  })

  it('returns undefined without repeated channels', () => {
    expect(getFixtureTypeSegments(parType)).toBeUndefined()
  })

  it('can be disabled', () => {
    expect(getFixtureTypeSegments({ ...barType, segments: false })).toBe(
      undefined
    )
  })
})

describe('getSegmentFixtureType', () => {
  it('replaces the channels of other segments', () => {
    expect(getSegmentFixtureType(barType, 1)?.mapping).toEqual([
      'eff',
      'm',
      '-',
      '-',
      '-',
      'r',
      'g',
      'b',
      '-',
      '-',
      '-',
    ])
  })
})

describe('parseSegmentMemberId', () => {
  it.each<[string, ReturnType<typeof parseSegmentMemberId>]>([
    ['bar1@2', { fixtureId: 'bar1', segment: 2 }],
    ['a@b@10', { fixtureId: 'a@b', segment: 10 }],
    ['bar1', undefined],
    ['bar1@', undefined],
    ['@2', undefined],
    ['bar1@x', undefined],
  ])('%s', (input, expected) => {
    expect(parseSegmentMemberId(input)).toEqual(expected)
  })
})

describe('toggleFixtureMappingSegments', () => {
  it('toggles the prefix', () => {
    expect(toggleFixtureMappingSegments('group:g')).toBe('segments:group:g')
    expect(toggleFixtureMappingSegments('segments:group:g')).toBe('group:g')
    expect(toggleFixtureMappingSegments('segments:group:g', true)).toBe(
      'segments:group:g'
    )
  })
})

describe('mapFixtureList', () => {
  it.each<[string, string[], string[]]>([
    ['ignores the segments prefix', ['segments:group:g'], ['bar1', 'par1']],
    ['maps segments to their fixture', ['bar1@2', 'bar1@3'], ['bar1']],
  ])('%s', (_, input, expected) => {
    expect(mapFixtureList(input, masterDataWithMaps)).toEqual(expected)
  })
})

describe('mapFixtureMemberList', () => {
  it.each<[string, string[], string[]]>([
    ['returns plain fixtures', ['bar1', 'par1'], ['bar1', 'par1']],
    [
      'splits fixtures into segments',
      ['segments:bar1'],
      ['bar1@1', 'bar1@2', 'bar1@3'],
    ],
    [
      'splits mapped fixtures that have segments',
      ['segments:group:g'],
      ['bar1@1', 'bar1@2', 'bar1@3', 'par1'],
    ],
    ['returns single segments', ['bar1@2'], ['bar1@2']],
    ['skips invalid segments', ['bar1@4', 'par1@1', 'none@1'], []],
    [
      'maps each member only once',
      ['bar1@2', 'segments:bar1'],
      ['bar1@2', 'bar1@1', 'bar1@3'],
    ],
  ])('%s', (_, input, expected) => {
    expect(mapFixtureMemberList(input, masterDataWithMaps)).toEqual(expected)
  })
})

describe('getMemberFixture', () => {
  it('returns fixtures', () => {
    expect(getMemberFixture('par1', masterDataMaps)).toBe(fixtures[1])
  })

  it('computes segment coordinates', () => {
    const segments = [1, 2, 3].map(it =>
      getMemberFixture(`bar1@${it}`, masterDataMaps)!
    )
    expect(segments.map(it => [it.id, it.x, it.y])).toEqual([
      ['bar1@1', 47, 50],
      ['bar1@2', 50, 50],
      ['bar1@3', 53, 50],
    ])
  })

  it('applies the fixture rotation', () => {
    const rotated: Fixture = { ...fixtures[0], id: 'rot', rotation: 90 }
    const maps = {
      ...masterDataMaps,
      fixtures: new Map([['rot', rotated]]),
    }
    const segment = getMemberFixture('rot@1', maps)!
    expect(segment.x).toBeCloseTo(50)
    expect(segment.y).toBeCloseTo(47)
  })
})

describe('writeFixtureStatesToUniverse', () => {
  const write = (states: Dictionary<FixtureState>) => {
    const universe = Array.from({ length: 40 }, () => 0)
    writeFixtureStatesToUniverse(universe, states, masterDataMaps)
    return universe
  }

  it('writes whole fixtures', () => {
    expect(
      write({ bar1: { on: true, channels: { m: 255, r: 10 } } }).slice(0, 11)
    ).toEqual([0, 255, 10, 0, 0, 10, 0, 0, 10, 0, 0])
  })

  it('writes single segments', () => {
    expect(
      write({
        'bar1@1': { on: true, channels: { m: 255, r: 10 } },
        'bar1@3': { on: true, channels: { m: 255, g: 20, eff: 5 } },
      }).slice(0, 11)
    ).toEqual([5, 255, 10, 0, 0, 0, 0, 0, 0, 20, 0])
  })

  it('emulates different master values with the shared master channel', () => {
    expect(
      write({
        'bar1@1': { on: true, channels: { m: 200, r: 100 } },
        'bar1@2': { on: true, channels: { m: 100, r: 100 } },
        'bar1@3': { on: false, channels: { m: 255, r: 100 } },
      }).slice(0, 11)
    ).toEqual([0, 200, 100, 0, 0, 50, 0, 0, 0, 0, 0])
  })

  it('applies the virtual master per segment without master channel', () => {
    expect(
      write({
        'nm1@1': { on: true, channels: { m: 255, r: 100 } },
        'nm1@2': { on: true, channels: { m: 51, r: 100 } },
      }).slice(29, 31)
    ).toEqual([100, 20])
  })

  it('writes the master channels of each segment', () => {
    expect(
      write({
        'sm1@1': { on: true, channels: { m: 200, r: 100, str: 10 } },
        'sm1@2': { on: true, channels: { m: 100, r: 100 } },
      }).slice(34, 39)
    ).toEqual([10, 100, 200, 100, 100])
  })
})
