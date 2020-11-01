import {
  MemoryState,
  MemoryScene,
  FixtureState,
  FixtureStateGradient,
  Dictionary,
} from '@vlight/types'
import { ensureBetween, getFraction, getValueForFraction } from '@vlight/utils'

import { interpolateGradientPositions } from './gradient'

export enum ScenePattern {
  Row = 'row',
  Alternate = 'alternate',
}

export function mergeMemoryStates(
  state1: MemoryState | undefined,
  state2: Partial<MemoryState>
): MemoryState {
  return {
    on: false,
    value: 255,
    ...state1,
    ...state2,
  }
}

export function getStateIndexAndFractionFor(
  scene: MemoryScene,
  memberIndex: number
): [number, number] {
  const numMembers = scene.members.length
  const numStates = scene.states.length
  switch (scene.pattern) {
    case ScenePattern.Alternate: {
      const stateIndex = memberIndex % numStates
      const firstForState = stateIndex
      const membersPerState = Math.ceil(numMembers / numStates)
      // can be higher than numMembers
      const lastForState = (membersPerState - 1) * numStates + stateIndex
      return [stateIndex, getFraction(memberIndex, firstForState, lastForState)]
    }
    case ScenePattern.Row:
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

function stateFromChannels(channels: Dictionary<number>): FixtureState {
  return { on: true, channels }
}

function mergeChannels(
  channels1: Dictionary<number>,
  channels2: Dictionary<number>,
  fraction: number
): Dictionary<number> {
  if (fraction <= 0) return channels1
  if (fraction >= 1) return channels2

  const keySet = new Set([...Object.keys(channels1), ...Object.keys(channels2)])

  return Array.from(keySet).reduce<Dictionary<number>>((obj, key) => {
    const value1 = channels1[key] ?? 0
    const value2 = channels2[key] ?? 0
    obj[key] = Math.round(getValueForFraction(fraction, value1, value2))
    return obj
  }, {})
}

export function getFixtureStateForGradientFraction(
  gradient: FixtureStateGradient[],
  fraction: number
): FixtureState {
  const firstState = stateFromChannels(gradient[0].channels)
  const lastState = stateFromChannels(gradient[gradient.length - 1].channels)

  if (fraction <= 0 || gradient.length === 1) return firstState
  if (fraction >= 1) return lastState

  const position = fraction * 100

  const gradientPositions = interpolateGradientPositions(
    gradient.map(entry => entry.position)
  )

  const nextIndex = gradientPositions.findIndex(
    entryPosition => entryPosition >= position
  )
  if (nextIndex === 0) return firstState
  if (nextIndex === -1) return lastState

  const nextPosition = gradientPositions[nextIndex]
  const nextChannels = gradient[nextIndex].channels
  if (nextPosition === position) return stateFromChannels(nextChannels)

  const prevIndex = nextIndex - 1
  const prevPosition = gradientPositions[prevIndex]
  const prevChannels = gradient[prevIndex].channels
  if (nextPosition === prevPosition) return stateFromChannels(prevChannels)

  const positionFraction = getFraction(position, prevPosition, nextPosition)

  return stateFromChannels(
    mergeChannels(prevChannels, nextChannels, positionFraction)
  )
}

export function getFixtureStateForMemoryScene(
  scene: MemoryScene,
  memberIndex: number
): FixtureState | undefined {
  const [stateIndex, fraction] = getStateIndexAndFractionFor(scene, memberIndex)
  const stateOrGradient = scene.states[stateIndex]

  if (Array.isArray(stateOrGradient)) {
    return getFixtureStateForGradientFraction(stateOrGradient, fraction)
  } else {
    return stateOrGradient
  }
}