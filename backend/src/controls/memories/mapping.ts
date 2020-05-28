import { MemoryState, Memory, MemoryScene } from '@vlight/entities'

import { masterDataMaps } from '../../services/masterdata'
import {
  Universe,
  createUniverse,
  getUniverseIndex,
} from '../../services/universe'
import { mapFixtureStateToChannels } from '../fixtures/mapping'
import { ChannelMapping } from '../../util/shared'

import { getFixtureStateFor } from './gradients'

export function getInitialMemoryState(): MemoryState {
  return {
    on: false,
    value: 255,
    initial: true,
  }
}

export interface MemoryPreparedState {
  fullUniverse: Universe
  affectedChannels: number[]
  fadedChannels: Set<number>
}

export function mapMemoryStateToChannel(
  preparedState: MemoryPreparedState,
  state: MemoryState,
  channel: number
): number {
  if (!state.on) return 0
  if (state.value === 0) return 0

  const fullChannelValue = preparedState.fullUniverse[getUniverseIndex(channel)]

  if (!preparedState.fadedChannels.has(channel)) {
    return fullChannelValue
  }

  if (state.value === 255) return fullChannelValue

  const rawValue = fullChannelValue * (state.value / 255)
  return Math.round(rawValue)
}

function applySceneToPreparedState(
  scene: MemoryScene,
  preparedState: MemoryPreparedState
) {
  const { fullUniverse, affectedChannels, fadedChannels } = preparedState

  scene.members.forEach((member, memberIndex) => {
    const fixture = masterDataMaps.fixtures.get(member)
    if (!fixture) return
    const { channel } = fixture
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)!

    const masterIndex = fixtureType.mapping.indexOf(ChannelMapping.master)

    const state = getFixtureStateFor(scene, memberIndex)

    mapFixtureStateToChannels(fixtureType, state).forEach((value, offset) => {
      const universeIndex = getUniverseIndex(channel) + offset
      if (fullUniverse[universeIndex] < value) {
        fullUniverse[universeIndex] = value
      }

      if (value !== 0) {
        affectedChannels.push(channel + offset)
        if (offset !== masterIndex) fadedChannels.add(channel + offset)
      }
    })
  })
}

export function createPreparedState(memory: Memory): MemoryPreparedState {
  const preparedState: MemoryPreparedState = {
    fullUniverse: createUniverse(),
    affectedChannels: [],
    fadedChannels: new Set(),
  }
  for (const scene of memory.scenes) {
    applySceneToPreparedState(scene, preparedState)
  }
  return preparedState
}
