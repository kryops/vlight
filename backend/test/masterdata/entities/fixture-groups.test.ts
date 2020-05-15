import { fillEntity } from '../../../src/services/masterdata/entities'
import { processFixtureGroups } from '../../../src/services/masterdata/entities/fixture-groups'

import { fixtureTypes, fixtures, mockFixtureGroup } from './mocks'

describe('processFixtureGroups', () => {
  beforeAll(() => {
    fillEntity('fixtureTypes', fixtureTypes)
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
