import {
  MemoryScene,
  FixtureState,
  FixtureStateGradient,
  Dictionary,
} from '@vlight/types'
import { arrayRange } from '@vlight/utils'

import {
  ScenePattern,
  getFixtureStateForGradientFraction,
  getStateIndexAndFractionFor,
  getFixtureStateForMemoryScene,
} from '../src/memories'

const channels1 = { r: 255 }
const channels2 = { g: 255 }
const channels3 = { b: 255 }

const state1: FixtureState = { on: true, channels: channels1 }
const state2: FixtureState = { on: true, channels: channels2 }

const linearGradient: FixtureStateGradient[] = [
  { channels: channels1 },
  { channels: channels2 },
  { channels: channels3 },
]

const positionGradient: FixtureStateGradient[] = [
  { channels: channels1 },
  { channels: channels2, position: 25 },
  { channels: channels3 },
]

const edgePositionGradient: FixtureStateGradient[] = [
  { channels: channels1, position: 25 },
  { channels: channels2 },
  { channels: channels3, position: 75 },
]

const samePositionGradient: FixtureStateGradient[] = [
  { channels: channels1 },
  { channels: channels2, position: 50 },
  { channels: channels3, position: 50 },
]

describe('getStateIndexAndFractionFor', () => {
  it.each<[ScenePattern, number, number, number[], number[]]>([
    /* ROW */

    // only 1 state
    [ScenePattern.Row, 5, 1, [0, 0, 0, 0, 0], [0, 0.25, 0.5, 0.75, 1]],
    // states = members
    [ScenePattern.Row, 5, 5, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],
    // pefect fit
    [ScenePattern.Row, 6, 2, [0, 0, 0, 1, 1, 1], [0, 0.5, 1, 0, 0.5, 1]],
    // last one cut
    [ScenePattern.Row, 5, 3, [0, 0, 1, 1, 2], [0, 1, 0, 1, 0]],
    // last one cut - position is shrunk to fit
    [
      ScenePattern.Row,
      8,
      3,
      [0, 0, 0, 1, 1, 1, 2, 2],
      [0, 0.5, 1, 0, 0.5, 1, 0, 1],
    ],
    // only one cut
    [ScenePattern.Row, 5, 7, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],

    /* ALTERNATE */

    // only 1 state
    [ScenePattern.Alternate, 5, 1, [0, 0, 0, 0, 0], [0, 0.25, 0.5, 0.75, 1]],
    // states = members
    [ScenePattern.Alternate, 5, 5, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],
    // pefect fit
    [ScenePattern.Alternate, 6, 2, [0, 1, 0, 1, 0, 1], [0, 0, 0.5, 0.5, 1, 1]],
    // last one cut
    [ScenePattern.Alternate, 5, 3, [0, 1, 2, 0, 1], [0, 0, 0, 1, 1]],
    // last one cut - position is not shrunk
    [
      ScenePattern.Alternate,
      8,
      3,
      [0, 1, 2, 0, 1, 2, 0, 1],
      [0, 0, 0, 0.5, 0.5, 0.5, 1, 1],
    ],
    // only one cut
    [ScenePattern.Alternate, 5, 7, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],
  ])(
    '%p - %p members, %p states => %p / %p',
    (
      pattern,
      numMembers,
      numStates,
      expectedStateIndexes,
      expectedPositions
    ) => {
      const scene: MemoryScene = {
        pattern,
        members: new Array(numMembers) as any,
        states: new Array(numStates) as any,
      }
      const stateIndexes = []
      const positions = []
      for (let i = 0; i < numMembers; i++) {
        const [stateIndex, position] = getStateIndexAndFractionFor(scene, i)
        stateIndexes.push(stateIndex)
        positions.push(position)
      }
      expect(stateIndexes).toEqual(expectedStateIndexes)
      expect(positions).toEqual(expectedPositions)
    }
  )
})

describe('getFixtureStateForGradientFraction', () => {
  it.each<[string, number, Dictionary<number>, FixtureStateGradient[]]>([
    ['linear gradient', 0, channels1, linearGradient],
    ['linear gradient', 0.25, { r: 128, g: 128 }, linearGradient],
    ['linear gradient', 0.5, channels2, linearGradient],
    ['linear gradient', 0.75, { g: 128, b: 128 }, linearGradient],
    ['linear gradient', 1, channels3, linearGradient],

    ['position gradient', 0, channels1, positionGradient],
    ['position gradient', 0.25, channels2, positionGradient],
    ['position gradient', 0.5, { g: 170, b: 85 }, positionGradient],
    ['position gradient', 0.75, { g: 85, b: 170 }, positionGradient],
    ['position gradient', 1, channels3, positionGradient],

    ['edge position gradient', 0, channels1, edgePositionGradient],
    ['edge position gradient', 0.25, channels1, edgePositionGradient],
    ['edge position gradient', 0.5, channels2, edgePositionGradient],
    ['edge position gradient', 0.75, channels3, edgePositionGradient],
    ['edge position gradient', 1, channels3, edgePositionGradient],

    ['same position gradient', 0, channels1, samePositionGradient],
    ['same position gradient', 0.25, { r: 128, g: 128 }, samePositionGradient],
    ['same position gradient', 0.5, channels2, samePositionGradient],
    ['same position gradient', 0.75, channels3, samePositionGradient],
    ['same position gradient', 1, channels3, samePositionGradient],
  ])('%s - position %s => %p', (_, fraction, expectedChannels, gradient) => {
    expect(getFixtureStateForGradientFraction(gradient, fraction)).toEqual({
      on: true,
      channels: expectedChannels,
    })
  })
})

describe('getFixtureStateFor', () => {
  describe('plain states', () => {
    it.each<[ScenePattern, string, number, FixtureState[], FixtureState[]]>([
      [
        ScenePattern.Row,
        'single state',
        5,
        [state1],
        [state1, state1, state1, state1, state1],
      ],
      [
        ScenePattern.Row,
        'two states',
        5,
        [state1, state2],
        [state1, state1, state1, state2, state2],
      ],
      [
        ScenePattern.Alternate,
        'single state',
        5,
        [state1],
        [state1, state1, state1, state1, state1],
      ],
      [
        ScenePattern.Alternate,
        'two states',
        5,
        [state1, state2],
        [state1, state2, state1, state2, state1],
      ],
    ])(
      '%p - %s, %p members',
      (pattern, _, numMembers, states, expectedMemberStates) => {
        const scene: MemoryScene = {
          pattern,
          members: new Array(numMembers) as any,
          states,
        }
        const membersStates = arrayRange(0, numMembers - 1, i => i).map(index =>
          getFixtureStateForMemoryScene(scene, index)
        )
        expect(membersStates).toEqual(expectedMemberStates)
      }
    )
  })

  describe('gradients', () => {
    it.each<
      [
        ScenePattern,
        string,
        number,
        Array<FixtureState | FixtureStateGradient[]>,
        Dictionary<number>[],
      ]
    >([
      // linear

      [
        ScenePattern.Row,
        'single linear gradient',
        5,
        [linearGradient],
        [
          channels1,
          { r: 128, g: 128 },
          channels2,
          { g: 128, b: 128 },
          channels3,
        ],
      ],
      [
        ScenePattern.Row,
        'linear gradient mixed with plain state',
        5,
        [linearGradient, state1],
        [channels1, channels2, channels3, channels1, channels1],
      ],
      [
        ScenePattern.Alternate,
        'single linear gradient',
        5,
        [linearGradient],
        [
          channels1,
          { r: 128, g: 128 },
          channels2,
          { g: 128, b: 128 },
          channels3,
        ],
      ],
      [
        ScenePattern.Alternate,
        'linear gradient mixed with plain state',
        5,
        [linearGradient, state1],
        [channels1, channels1, channels2, channels1, channels3],
      ],

      // positional

      [
        ScenePattern.Row,
        'single positional gradient',
        5,
        [positionGradient],
        [channels1, channels2, { g: 170, b: 85 }, { g: 85, b: 170 }, channels3],
      ],

      [
        ScenePattern.Row,
        'positional gradient mixed with plain state',
        5,
        [positionGradient, state1],
        [channels1, { g: 170, b: 85 }, channels3, channels1, channels1],
      ],

      [
        ScenePattern.Alternate,
        'single positional gradient',
        5,
        [positionGradient],
        [channels1, channels2, { g: 170, b: 85 }, { g: 85, b: 170 }, channels3],
      ],

      [
        ScenePattern.Alternate,
        'positional gradient mixed with plain state',
        5,
        [positionGradient, state1],
        [channels1, channels1, { g: 170, b: 85 }, channels1, channels3],
      ],
    ])(
      '%p - %s, %p members',
      (pattern, _, numMembers, states, expectedMemberChannels) => {
        const scene: MemoryScene = {
          pattern,
          members: new Array(numMembers) as any,
          states,
        }
        const membersStates = arrayRange(0, numMembers - 1, i => i).map(index =>
          getFixtureStateForMemoryScene(scene, index)
        )
        expect(membersStates).toEqual(
          expectedMemberChannels.map(channels => ({ on: true, channels }))
        )
      }
    )
  })
})
