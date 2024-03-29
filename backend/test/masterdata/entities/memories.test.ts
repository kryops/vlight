import { fillMasterDataEntity } from '../../../src/services/masterdata'
import { processMemories } from '../../../src/services/masterdata/entities/memories'

import { fixtureTypes, fixtures, fixtureGroups, mockMemory } from './mocks'

describe('processMemories', () => {
  beforeAll(() => {
    fillMasterDataEntity('fixtureTypes', fixtureTypes)
    fillMasterDataEntity('fixtures', fixtures)
    fillMasterDataEntity('fixtureGroups', fixtureGroups)
  })

  it.each<[string, string[][], string[][]]>([
    ['just returns fixtures', [['foo1']], [['foo1']]],
    ['handles multiple scenes', [['foo1'], ['foo2']], [['foo1'], ['foo2']]],
    ['maps counted fixtures', [['all:bar']], [['bar1', 'bar2']]],
    ['maps fixtures by type', [['type:foo']], [['foo1', 'foo2']]],
    ['maps fixtures by group', [['group:group1']], [['baz1']]],
    ['maps each fixture only once', [['baz1', 'baz1']], [['baz1']]],
    [
      'all of the above',
      [['group:group1', 'baz1', 'all:bar', 'type:baz'], ['type:foo']],
      [
        ['baz1', 'bar1', 'bar2'],
        ['foo1', 'foo2'],
      ],
    ],
  ])('%s', (_, input, expected) => {
    expect(processMemories([mockMemory(input)])).toEqual([mockMemory(expected)])
  })
})
