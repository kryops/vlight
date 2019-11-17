import { MemoryScene } from '@vlight/entities'

import {
  ScenePattern,
  getStateIndexAndPositionFor,
} from '../../../src/controls/memories/gradients'

describe('getStateIndexAndPositionFor', () => {
  it.each<[ScenePattern, number, number, number[], number[]]>([
    /* ROW */

    // only 1 state
    [ScenePattern.ROW, 5, 1, [0, 0, 0, 0, 0], [0, 0.25, 0.5, 0.75, 1]],
    // states = members
    [ScenePattern.ROW, 5, 5, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],
    // pefect fit
    [ScenePattern.ROW, 6, 2, [0, 0, 0, 1, 1, 1], [0, 0.5, 1, 0, 0.5, 1]],
    // last one cut
    [ScenePattern.ROW, 5, 3, [0, 0, 1, 1, 2], [0, 1, 0, 1, 0]],
    // last one cut - position is shrunk to fit
    [
      ScenePattern.ROW,
      8,
      3,
      [0, 0, 0, 1, 1, 1, 2, 2],
      [0, 0.5, 1, 0, 0.5, 1, 0, 1],
    ],
    // only one cut
    [ScenePattern.ROW, 5, 7, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],

    /* ALTERNATE */

    // only 1 state
    [ScenePattern.ALTERNATE, 5, 1, [0, 0, 0, 0, 0], [0, 0.25, 0.5, 0.75, 1]],
    // states = members
    [ScenePattern.ALTERNATE, 5, 5, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],
    // pefect fit
    [ScenePattern.ALTERNATE, 6, 2, [0, 1, 0, 1, 0, 1], [0, 0, 0.5, 0.5, 1, 1]],
    // last one cut
    [ScenePattern.ALTERNATE, 5, 3, [0, 1, 2, 0, 1], [0, 0, 0, 1, 1]],
    // last one cut - position is not shrunk
    [
      ScenePattern.ALTERNATE,
      8,
      3,
      [0, 1, 2, 0, 1, 2, 0, 1],
      [0, 0, 0, 0.5, 0.5, 0.5, 1, 1],
    ],
    // only one cut
    [ScenePattern.ALTERNATE, 5, 7, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0]],
  ])(
    '%p - %p members, %p states => %p',
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
        const [stateIndex, position] = getStateIndexAndPositionFor(scene, i)
        stateIndexes.push(stateIndex)
        positions.push(position)
      }
      expect(stateIndexes).toEqual(expectedStateIndexes)
      expect(positions).toEqual(expectedPositions)
    }
  )
})
