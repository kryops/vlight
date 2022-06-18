import {
  MemoryState,
  MemoryScene,
  FixtureState,
  FixtureStateGradient,
  FixtureChannels,
} from '@vlight/types'
import { ensureBetween, valueToFraction, fractionToValue } from '@vlight/utils'

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
    forceMaster: false,
    ...state1,
    ...state2,
    initial: undefined, // reset initial state
  }
}

/**
 * Returns a tuple containing
 * - the index of the scene state to apply for the member with the given index
 * - the gradient fraction to apply
 *
 * Applies the scene's pattern.
 */
export function getStateIndexAndFractionFor(
  scene: MemoryScene,
  memberIndex: number,
  members?: string[]
): [number, number] {
  const numMembers = members?.length ?? scene.members.length
  const numStates = scene.states.length
  switch (scene.pattern) {
    case ScenePattern.Alternate: {
      const stateIndex = memberIndex % numStates
      const firstForState = stateIndex
      const membersPerState = Math.ceil(numMembers / numStates)
      // can be higher than numMembers
      const lastForState = (membersPerState - 1) * numStates + stateIndex
      return [
        stateIndex,
        valueToFraction(memberIndex, firstForState, lastForState),
      ]
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
      return [
        stateIndex,
        valueToFraction(memberIndex, firstForState, lastForState),
      ]
    }
  }
}

function stateFromChannels(channels: FixtureChannels): FixtureState {
  return { on: true, channels }
}

function mergeChannels(
  channels1: FixtureChannels,
  channels2: FixtureChannels,
  fraction: number
): FixtureChannels {
  if (fraction <= 0) return channels1
  if (fraction >= 1) return channels2

  const keySet = new Set([...Object.keys(channels1), ...Object.keys(channels2)])

  return Array.from(keySet).reduce<FixtureChannels>((obj, key) => {
    const value1 = channels1[key] ?? 0
    const value2 = channels2[key] ?? 0
    obj[key] = Math.round(fractionToValue(fraction, value1, value2))
    return obj
  }, {})
}

/**
 * Computes the fixture state at a certain position (= fraction) of the given gradient.
 */
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

  const positionFraction = valueToFraction(position, prevPosition, nextPosition)

  return stateFromChannels(
    mergeChannels(prevChannels, nextChannels, positionFraction)
  )
}

/**
 * Returns the fixture state for the memory scene member with the given index.
 */
export function getFixtureStateForMemoryScene(
  scene: MemoryScene,
  memberIndex: number,
  members?: string[]
): FixtureState {
  const [stateIndex, fraction] = getStateIndexAndFractionFor(
    scene,
    memberIndex,
    members
  )
  const stateOrGradient = scene.states[stateIndex] ?? {
    channels: {},
    on: false,
  }

  if (Array.isArray(stateOrGradient)) {
    return getFixtureStateForGradientFraction(stateOrGradient, fraction)
  } else {
    return stateOrGradient
  }
}
