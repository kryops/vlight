import { MasterData, MasterDataMaps } from '@vlight/entities'

import { entityArrayToMap, mapFixtureList } from '../src'

import { fixtures, fixtureTypes, fixtureGroups } from './mocks'

const masterData: MasterData = {
  fixtureTypes,
  fixtures,
  fixtureGroups,
  dynamicPages: [],
  memories: [],
}

const masterDataMaps: MasterDataMaps = {
  fixtureTypes: entityArrayToMap(fixtureTypes),
  fixtures: entityArrayToMap(fixtures),
  fixtureGroups: entityArrayToMap(fixtureGroups),
  dynamicPages: new Map(),
  memories: new Map(),
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
