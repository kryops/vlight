import { MemoryState } from '@vlight/entities'

import {
  createPreparedState,
  MemoryPreparedState,
  mapMemoryStateToChannel,
} from '../../../src/controls/memories/mapping'
import { fillEntity } from '../../../src/services/masterdata/entities'
import { createUniverse } from '../../../src/services/universe'
import {
  fixtureTypes,
  fixtures,
  fixtureGroups,
  mockMemory,
} from '../../masterdata/entities/mocks'

describe('controls/memories/mapping', () => {
  describe('mapMemoryStateToChannel', () => {
    const fullUniverse = createUniverse()
    fullUniverse[2] = 255
    fullUniverse[3] = 100
    const preparedState: MemoryPreparedState = {
      fullUniverse,
      affectedChannels: [3, 4],
      fadedChannels: new Set([4]),
    }

    const stateOn: MemoryState = { on: true, value: 255 }
    const stateHalf: MemoryState = { on: true, value: 127 }
    const stateZero: MemoryState = { on: true, value: 0 }
    const stateOff: MemoryState = { on: false, value: 255 }

    it.each<[string, number, number, MemoryState]>([
      ['on (affected)', 3, 255, stateOn],
      ['on (faded)', 4, 100, stateOn],
      ['half (affected)', 3, 255, stateHalf],
      ['half (faded)', 4, 50, stateHalf],
      ['zero (affected)', 3, 0, stateZero],
      ['zero (faded)', 4, 0, stateZero],
      ['off (affected)', 3, 0, stateOff],
      ['off (faded)', 4, 0, stateOff],
    ])('state %p => channel %p = %p', (_, channel, expected, state) => {
      expect(mapMemoryStateToChannel(preparedState, state, channel)).toBe(
        expected
      )
    })
  })

  describe('createPreparedState', () => {
    beforeAll(() => {
      fillEntity('fixtureTypes', fixtureTypes)
      fillEntity('fixtures', fixtures)
      fillEntity('fixtureGroups', fixtureGroups)
    })

    it('creates the prepared state', () => {
      const memory = mockMemory([['bar1'], ['baz1']])
      const preparedState = createPreparedState(memory)
      expect(preparedState.fullUniverse.slice(0, 12)).toEqual(
        Buffer.from([0, 0, 255, 0, 0, 0, 0, 0, 0, 255, 0, 0])
      )
      expect(preparedState.affectedChannels).toEqual([3, 10])
      expect(preparedState.fadedChannels).toEqual(new Set([3, 10]))
    })
  })
})
