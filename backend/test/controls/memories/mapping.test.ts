import { MemoryState } from '@vlight/entities'

import {
  mapMemoryStateToChannelValue,
  getAffectedChannels,
  createFullUniverse,
} from '../../../src/controls/memories/mapping'
import { createUniverse } from '../../../src/services/universe'
import { fillEntity } from '../../../src/database'
import {
  fixtureTypes,
  fixtures,
  fixtureGroups,
  mockMemory,
} from '../../database/mocks'

describe('controls/memories/mapping', () => {
  describe('mapMemoryStateToChannelValue', () => {
    it.each<[string, number, number, MemoryState]>([
      ['off', 255, 0, { on: false, value: 255 }],
      ['value 0', 255, 0, { on: true, value: 0 }],
      ['full on', 255, 255, { on: true, value: 255 }],
      ['half on', 255, 127, { on: true, value: 127 }],
      ['half on', 100, 50, { on: true, value: 127 }],
      ['half on (0 anyway)', 0, 0, { on: true, value: 127 }],
    ])('%p: %p => %p', (_, value, expected, state) => {
      expect(mapMemoryStateToChannelValue(value, state)).toBe(expected)
    })
  })

  describe('createFullUniverse', () => {
    beforeAll(() => {
      fillEntity('fixtureTypes', fixtureTypes)
      fillEntity('fixtures', fixtures)
      fillEntity('fixtureGroups', fixtureGroups)
    })

    it("maps the memory's scenes to universe", () => {
      const memory = mockMemory([['bar1'], ['baz1']])
      const fullUniverse = createFullUniverse(memory)
      expect(fullUniverse.slice(0, 12)).toEqual(
        Buffer.from([0, 0, 255, 0, 0, 0, 0, 0, 0, 255, 0, 0])
      )
    })
  })

  it('getAffectedChannels', () => {
    const universe = createUniverse()
    universe[2] = 1
    universe[4] = 255
    expect(getAffectedChannels(universe)).toEqual([3, 5])
  })
})
