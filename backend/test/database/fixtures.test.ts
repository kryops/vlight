import { Fixture } from '@vlight/entities'

import {
  processFixtures,
  mapFixtureList,
} from '../../src/database/entities/fixtures'
import { fillEntity } from '../../src/database/access'

import { fixtureTypes, fixtures, fixtureGroups } from './mocks'

describe('processFixtures', () => {
  beforeAll(() => {
    fillEntity('fixtureTypes', fixtureTypes)
  })

  it('just returns single fixtures', () => {
    const fixtures: Fixture[] = [
      {
        id: 'foo',
        type: 'bar',
        channel: 1,
      },
    ]
    expect(processFixtures(fixtures)).toEqual(fixtures)
  })

  it('handles multi fixtures', () => {
    const fixtures: Fixture[] = [
      {
        id: 'foo#',
        type: 'bar',
        name: 'Foo #',
        channel: 1,
        count: 3,
      },
    ]
    expect(processFixtures(fixtures)).toEqual([
      {
        id: 'foo1',
        type: 'bar',
        name: 'Foo 1',
        channel: 1,
        originalId: 'foo#',
      },
      {
        id: 'foo2',
        type: 'bar',
        name: 'Foo 2',
        channel: 4,
        originalId: 'foo#',
      },
      {
        id: 'foo3',
        type: 'bar',
        name: 'Foo 3',
        channel: 7,
        originalId: 'foo#',
      },
    ])
  })
})

describe('mapFixtureList', () => {
  beforeAll(() => {
    fillEntity('fixtureTypes', fixtureTypes)
    fillEntity('fixtures', fixtures)
    fillEntity('fixtureGroups', fixtureGroups)
  })

  it.each<[string, string[], string[]]>([
    ['just returns fixtures', ['foo1'], ['foo1']],
    ['maps counted fixtures', ['bar#'], ['bar1', 'bar2']],
    ['maps fixtures by type', ['type:foo'], ['foo1', 'foo2']],
    ['maps fixtures by group', ['group:group1'], ['baz1']],
    ['maps each fixture only once', ['foo1', 'foo1'], ['foo1']],
    [
      'all of the above',
      ['foo1', 'bar#', 'type:bar'],
      ['foo1', 'bar1', 'bar2'],
    ],
    ['skips mapping for non-existent types', ['type:none'], []],
    ['skips mapping for non-existent groups', ['group:none'], []],
    ['skips mapping for non-existent counted fixture IDs', ['none#'], []],
    ['skips mapping for non-existent fixtures', ['none'], []],
  ])('%s', (_, input, expected) => {
    expect(mapFixtureList(input)).toEqual(expected)
  })
})
