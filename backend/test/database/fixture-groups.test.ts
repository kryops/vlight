import { FixtureType, Fixture, FixtureGroup } from '@vlight/entities'

import { fillEntity } from '../../src/database'
import { processFixtureGroups } from '../../src/database/entities/fixture-groups'

describe('processFixtureGroups', () => {
  function mockFixtureGroup(fixtures: string[]): FixtureGroup {
    return {
      id: 'g',
      name: 'G',
      fixtures,
    }
  }

  beforeAll(() => {
    const fixtureTypes: FixtureType[] = [
      {
        id: 'foo',
        name: 'Foo',
        mapping: ['m'],
      },
      {
        id: 'bar',
        name: 'Bar',
        mapping: ['r', 'g', 'b'],
      },
    ]
    fillEntity('fixtureTypes', fixtureTypes)

    const fixtures: Fixture[] = [
      {
        id: 'foo1',
        name: 'Foo 1',
        type: 'foo',
        channel: 1,
      },
      {
        id: 'foo2',
        name: 'Foo 2',
        type: 'foo',
        channel: 2,
      },
      {
        id: 'bar1',
        originalId: 'bar#',
        name: 'Bar 1',
        type: 'bar',
        channel: 3,
      },
      {
        id: 'bar2',
        originalId: 'bar#',
        name: 'Bar 2',
        type: 'bar',
        channel: 6,
      },
    ]

    fillEntity('fixtures', fixtures)
  })

  it.each<[string, string[], string[]]>([
    ['just returns fixtures', ['foo1'], ['foo1']],
    ['maps counted fixtures', ['bar#'], ['bar1', 'bar2']],
    ['maps fixtures by type', ['type:foo'], ['foo1', 'foo2']],
    ['maps each fixture only once', ['foo1', 'foo1'], ['foo1']],
    [
      'all of the above',
      ['foo1', 'bar#', 'type:bar'],
      ['foo1', 'bar1', 'bar2'],
    ],
  ])('%s', (_, input, expected) => {
    expect(processFixtureGroups([mockFixtureGroup(input)])).toEqual([
      mockFixtureGroup(expected),
    ])
  })
})
