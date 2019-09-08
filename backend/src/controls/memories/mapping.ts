import { MemoryState, Memory, MemoryScene } from '@vlight/entities'

import { fixtures, fixtureTypes } from '../../database'
import {
  Universe,
  getChannelFromUniverseIndex,
  createUniverse,
  getUniverseIndex,
} from '../../services/universe'
import { isTruthy } from '../../util/validation'
import { mapFixtureStateToChannels } from '../fixtures/mapping'

export function getInitialMemoryState(): MemoryState {
  return {
    on: false,
    value: 255,
    initial: true,
  }
}

export function mapMemoryStateToChannelValue(
  fullChannelValue: number,
  state: MemoryState
) {
  if (!state.on) return 0
  if (state.value === 0) return 0
  if (state.value === 255) return fullChannelValue

  const rawValue = fullChannelValue * (state.value / 255)
  return Math.round(rawValue)
}

function applySceneToFullUniverse(
  { members, state }: MemoryScene,
  universe: Universe
) {
  const sceneFixtures = members
    .map(member => fixtures.get(member))
    .filter(isTruthy)

  for (const { type, channel } of sceneFixtures) {
    const fixtureType = fixtureTypes.get(type)!
    mapFixtureStateToChannels(fixtureType, state).forEach((value, offset) => {
      const universeIndex = getUniverseIndex(channel) + offset
      if (universe[universeIndex] < value) universe[universeIndex] = value
    })
  }
}

export function createFullUniverse(memory: Memory) {
  const universe = createUniverse()
  for (const scene of memory.scenes) {
    applySceneToFullUniverse(scene, universe)
  }
  return universe
}

export function getAffectedChannels(universe: Universe) {
  return universe.reduce<number[]>((acc, value, index) => {
    if (value) acc.push(getChannelFromUniverseIndex(index))
    return acc
  }, [])
}
