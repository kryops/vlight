import { FixtureState, FixtureType } from '@vlight/types'

import { mapFixtureStateToChannels } from '../../../src/controls/fixtures/mapping'

describe('controls/fixtures/mapping', () => {
  describe('mapFixtureStateToChannels', () => {
    const fixtureTypeWithMaster: FixtureType = {
      id: '1',
      name: 'foo',
      mapping: ['r', 'g', 'b', 'm'],
    }
    const fixtureTypeWithoutMaster: FixtureType = {
      id: '2',
      name: 'bar',
      mapping: ['r', 'g', 'b', 'a'],
    }

    const exampleState: FixtureState = {
      on: true,
      channels: {
        r: 100,
        g: 150,
        m: 200,
      },
    }

    const turnedOff: FixtureState = {
      on: false,
      channels: {
        r: 100,
      },
    }

    it.each<[string, FixtureType, FixtureState, number[]]>([
      [
        'turned off (with master)',
        fixtureTypeWithMaster,
        turnedOff,
        [0, 0, 0, 0],
      ],
      [
        'turned off (without master)',
        fixtureTypeWithoutMaster,
        turnedOff,
        [0, 0, 0, 0],
      ],
      [
        'example state (with master)',
        fixtureTypeWithMaster,
        exampleState,
        [78, 118, 0, 255],
      ],
      [
        'example state (without master)',
        fixtureTypeWithoutMaster,
        exampleState,
        [78, 118, 0, 0],
      ],
    ])('%p', (_, fixtureType, state, expected) => {
      expect(mapFixtureStateToChannels(fixtureType, state)).toEqual(expected)
    })
  })
})
