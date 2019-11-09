import { fillEntity } from '../../src/database'
import { processMemories } from '../../src/database/entities/memories'

import { fixtureTypes, fixtures, fixtureGroups, mockMemory } from './mocks'

describe('processMemories', () => {
  beforeAll(() => {
    fillEntity('fixtureTypes', fixtureTypes)
    fillEntity('fixtures', fixtures)
    fillEntity('fixtureGroups', fixtureGroups)
  })

  it.each<[string, string[][], string[][]]>([
    ['just returns fixtures', [['foo1']], [['foo1']]],
    ['handles multiple scenes', [['foo1'], ['foo2']], [['foo1'], ['foo2']]],
    ['maps counted fixtures', [['bar#']], [['bar1', 'bar2']]],
    ['maps fixtures by type', [['type:foo']], [['foo1', 'foo2']]],
    ['maps fixtures by group', [['group:group1']], [['baz1']]],
    ['maps each fixture only once', [['baz1', 'baz1']], [['baz1']]],
    [
      'all of the above',
      [['group:group1', 'baz1', 'bar#', 'type:baz'], ['type:foo']],
      [
        ['baz1', 'bar1', 'bar2'],
        ['foo1', 'foo2'],
      ],
    ],
  ])('%s', (_, input, expected) => {
    expect(processMemories([mockMemory(input)])).toEqual([mockMemory(expected)])
  })
})
