import { FixtureState, FixtureType } from '@vlight/entities'

import { mapFixtureStateToChannels } from '../../../src/universe/fixtures/mapping'

describe('universe/fixtures/mapping', () => {
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

    it('turned off', () => {
      const state: FixtureState = {
        on: false,
        channels: {
          r: 100,
        },
      }
      const expected = [0, 0, 0, 0]
      expect(mapFixtureStateToChannels(fixtureTypeWithMaster, state)).toEqual(
        expected
      )
      expect(
        mapFixtureStateToChannels(fixtureTypeWithoutMaster, state)
      ).toEqual(expected)
    })

    it('with master channel', () => {
      const expected = [100, 150, 0, 200]
      expect(
        mapFixtureStateToChannels(fixtureTypeWithMaster, exampleState)
      ).toEqual(expected)
    })
    it('without master channel', () => {
      const expected = [78, 118, 0, 0]
      expect(
        mapFixtureStateToChannels(fixtureTypeWithoutMaster, exampleState)
      ).toEqual(expected)
    })
  })
})
