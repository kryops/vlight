import { FixtureType, Fixture, FixtureGroup } from '@vlight/entities'

import { fillEntity } from '../../src/database'
import { processFixtureGroups } from '../../src/database/fixture-groups'

describe('processFixtureGroups', () => {
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

  it('just returns fixtures', () => {
    const groups: FixtureGroup[] = [
      {
        id: 'g',
        name: 'G',
        fixtures: ['foo1', 'foo2', 'bar1'],
      },
    ]
    expect(processFixtureGroups(groups)).toEqual(groups)
  })

  it('returns multiple counted fixtures', () => {
    const groups: FixtureGroup[] = [
      {
        id: 'g',
        name: 'G',
        fixtures: ['bar#'],
      },
    ]
    expect(processFixtureGroups(groups)).toEqual([
      {
        id: 'g',
        name: 'G',
        fixtures: ['bar1', 'bar2'],
      },
    ])
  })

  it('returns multiple fixtures by type', () => {
    const groups: FixtureGroup[] = [
      {
        id: 'g',
        name: 'G',
        fixtures: ['type:foo'],
      },
    ]
    expect(processFixtureGroups(groups)).toEqual([
      {
        id: 'g',
        name: 'G',
        fixtures: ['foo1', 'foo2'],
      },
    ])
  })

  it('all of the above (including unique filter)', () => {
    const groups: FixtureGroup[] = [
      {
        id: 'g',
        name: 'G',
        fixtures: ['foo1', 'bar#', 'type:foo'],
      },
    ]
    expect(processFixtureGroups(groups)).toEqual([
      {
        id: 'g',
        name: 'G',
        fixtures: ['foo1', 'bar1', 'bar2', 'foo2'],
      },
    ])
  })
})
