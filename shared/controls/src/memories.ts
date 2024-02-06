import {
  MemoryState,
  MemoryScene,
  FixtureState,
  FixtureStateGradient,
  FixtureChannels,
  Fixture,
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

function getMemorySceneFixtureOrder(
  scene: MemoryScene,
  memberFixtures: Fixture[]
): Fixture[] {
  const isOrderedByCoords = scene.order === 'xcoord' || scene.order === 'ycoord'

  return !isOrderedByCoords
    ? memberFixtures
    : [...memberFixtures].sort((a, b) => {
        if (scene.order === 'xcoord' && a.x !== b.x) {
          return (a.x ?? 0) < (b.x ?? 0) ? -1 : 1
        }
        if (scene.order === 'ycoord' && a.y !== b.y) {
          return (a.y ?? 0) < (b.y ?? 0) ? -1 : 1
        }
        return 0
      })
}

export interface MemorySceneStateInfo {
  min: number
  max: number
  firstForState: number
  lastForState: number
  orderedFixtures: Fixture[]
}

export function getMemorySceneStateInfo(
  scene: MemoryScene,
  memberFixtures: Fixture[]
): MemorySceneStateInfo[] {
  const orderedFixtures = getMemorySceneFixtureOrder(scene, memberFixtures)
  const numMembers = orderedFixtures.length
  const numStates = scene.states.length

  const isOrderedByCoords = scene.order === 'xcoord' || scene.order === 'ycoord'

  const membersPerState = Math.ceil(numMembers / numStates)

  const getMinCoord = (fixtures: Fixture[]) =>
    isOrderedByCoords
      ? Math.min(
          ...fixtures.map(it => (scene.order === 'xcoord' ? it.x : it.y) ?? 0)
        )
      : 0

  const getMaxCoord = (fixtures: Fixture[]) =>
    isOrderedByCoords
      ? Math.max(
          ...fixtures.map(it => (scene.order === 'xcoord' ? it.x : it.y) ?? 0)
        )
      : 100

  return Array.from({ length: numStates })
    .fill(undefined)
    .map((_, stateIndex) => {
      switch (scene.pattern) {
        case ScenePattern.Alternate: {
          const firstForState = stateIndex
          // can be higher than numMembers
          const lastForState = (membersPerState - 1) * numStates + stateIndex
          const stateFixtures = orderedFixtures.filter(
            (_, index) => index % numStates === stateIndex
          )
          return {
            min: getMinCoord(stateFixtures),
            max: getMaxCoord(stateFixtures),
            firstForState,
            lastForState,
            orderedFixtures,
          }
        }
        case ScenePattern.Row:
        default: {
          const firstForState = stateIndex * membersPerState
          const lastForState = ensureBetween(
            firstForState + membersPerState - 1,
            0,
            numMembers - 1
          )
          const stateFixtures = orderedFixtures.slice(
            firstForState,
            lastForState
          )
          return {
            min: getMinCoord(stateFixtures),
            max: getMaxCoord(stateFixtures),
            firstForState,
            lastForState,
            orderedFixtures,
          }
        }
      }
    })
}

interface MemoryFractionArgs {
  scene: MemoryScene
  memberIndex: number
  memberFixtures: Fixture[]
  stateInfo: MemorySceneStateInfo[]
}

/**
 * Returns a tuple containing
 * - the index of the scene state to apply for the member with the given index
 * - the gradient fraction to apply
 *
 * Applies the scene's pattern.
 */
export function getStateIndexAndFractionFor({
  scene,
  memberIndex,
  memberFixtures,
  stateInfo,
}: MemoryFractionArgs): [number, number] {
  const fixture = memberFixtures[memberIndex] ?? {}
  const numMembers = memberFixtures.length
  const numStates = scene.states.length

  const isOrderedByCoords = scene.order === 'xcoord' || scene.order === 'ycoord'

  const finalIndex = !isOrderedByCoords
    ? memberIndex
    : stateInfo[0].orderedFixtures.indexOf(fixture)

  const membersPerState = Math.ceil(numMembers / numStates)

  const stateIndex =
    scene.pattern === ScenePattern.Alternate
      ? finalIndex % numStates
      : Math.floor(finalIndex / membersPerState)

  const { min, max, firstForState, lastForState } = stateInfo[stateIndex]
  return [
    stateIndex,
    isOrderedByCoords
      ? valueToFraction(
          (scene.order === 'xcoord' ? fixture.x : fixture.y) ?? 0,
          min,
          max
        )
      : valueToFraction(finalIndex, firstForState, lastForState),
  ]
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
  givenGradient: FixtureStateGradient[],
  fraction: number
): FixtureState {
  const gradient = getFinalGradient(givenGradient)

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
  args: MemoryFractionArgs
): FixtureState {
  const [stateIndex, fraction] = getStateIndexAndFractionFor(args)
  const stateOrGradient = args.scene.states[stateIndex] ?? {
    channels: {},
    on: false,
  }

  if (Array.isArray(stateOrGradient)) {
    return getFixtureStateForGradientFraction(stateOrGradient, fraction)
  } else {
    return stateOrGradient
  }
}

/**
 * If the given gradient is mirrored, returns a new gradient with the mirroring applied.
 */
export function getFinalGradient(
  gradient: FixtureStateGradient[]
): FixtureStateGradient[] {
  const mirrored = gradient.some(it => it.mirrored)
  if (!mirrored) return gradient

  const lastPosition = gradient[gradient.length - 1].position

  return [
    ...gradient.map(it => ({
      ...it,
      mirrored: false,
      position: it.position !== undefined ? it.position / 2 : undefined,
    })),
    ...gradient
      .slice(
        0,
        // we can take the last stop off if it is at the end
        lastPosition === undefined || lastPosition === 100 ? -1 : undefined
      )
      .reverse()
      .map(it => ({
        ...it,
        mirrored: false,
        position:
          it.position !== undefined ? 50 + (100 - it.position) / 2 : undefined,
      })),
  ]
}
