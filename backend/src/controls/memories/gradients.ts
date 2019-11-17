import { MemoryScene, FixtureState } from '@vlight/entities'

import { ensureBetween, getFraction } from '../../util/number'

export enum ScenePattern {
  ROW = 'row',
  ALTERNATE = 'alternate',
}

export function getStateIndexAndPositionFor(
  scene: MemoryScene,
  memberIndex: number
): [number, number] {
  const numMembers = scene.members.length
  const numStates = scene.states.length
  switch (scene.pattern) {
    case ScenePattern.ALTERNATE: {
      const stateIndex = memberIndex % numStates
      const firstForState = stateIndex
      const membersPerState = Math.ceil(numMembers / numStates)
      // can be higher than numMembers
      const lastForState = (membersPerState - 1) * numStates + stateIndex
      return [stateIndex, getFraction(memberIndex, firstForState, lastForState)]
    }
    case ScenePattern.ROW:
    default: {
      const fixturesPerState = Math.ceil(numMembers / numStates)
      const stateIndex = Math.floor(memberIndex / fixturesPerState)
      const firstForState = stateIndex * fixturesPerState
      const lastForState = ensureBetween(
        firstForState + fixturesPerState - 1,
        0,
        numMembers - 1
      )
      return [stateIndex, getFraction(memberIndex, firstForState, lastForState)]
    }
  }
}

export function getFixtureStateFor(
  scene: MemoryScene,
  memberIndex: number
): FixtureState {
  return scene.states[0] as any // TODO
}
