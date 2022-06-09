import {
  MemoryState,
  Memory,
  IdType,
  ApiMemoryStateMessage,
  Dictionary,
  FixtureState,
} from '@vlight/types'
import { dictionaryToMap, logger, forEach } from '@vlight/utils'
import {
  ChannelMapping,
  getFixtureStateForMemoryScene,
  mergeMemoryStates,
} from '@vlight/controls'

import { masterDataMaps, masterData } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  Universe,
  createUniverse,
  addUniverse,
  removeUniverse,
} from '../../services/universe'
import { howLong } from '../../util/time'
import { controlRegistry } from '../registry'
import { registerApiMessageHandler } from '../../services/api/registry'

import { initLiveMemories, liveMemories } from './live-memories'

export { liveMemories }

const outgoingUniverses: Map<IdType, Universe> = new Map()
export const memoryStates: Map<IdType, MemoryState> = new Map()

function usesMasterChannel(memory: Memory) {
  return memory.scenes.some(scene =>
    scene.states.some(state => {
      if (Array.isArray(state))
        return state.some(gradient => gradient.channels[ChannelMapping.Master])
      return state.channels[ChannelMapping.Master]
    })
  )
}

export function getInitialMemoryState(memory: Memory): MemoryState {
  return {
    on: false,
    value: 255,
    initial: true,
    forceMaster: !usesMasterChannel(memory),
  }
}

export function createMemoryUniverse(memory: Memory): Universe {
  const fixtureStates: Dictionary<FixtureState> = {}
  for (const scene of memory.scenes) {
    scene.members.forEach((member, memberIndex) => {
      const state = getFixtureStateForMemoryScene(scene, memberIndex)
      if (state) fixtureStates[member] = state
    })
  }
  return createUniverse(fixtureStates)
}

function initMemory(memory: Memory, oldMemoryStates: Map<IdType, MemoryState>) {
  const { id } = memory

  const universe = createMemoryUniverse(memory)
  const initialState = oldMemoryStates.get(id) ?? getInitialMemoryState(memory)
  outgoingUniverses.set(id, universe)
  setMemoryState(id, initialState, false)

  memoryStates.set(id, initialState)
}

function setMemoryState(
  id: IdType,
  state: Partial<MemoryState>,
  merge = false
): void {
  const memory = masterDataMaps.memories.get(id)
  if (!memory) {
    logger.warn('no memory found for ID', id)
    return
  }
  const oldState = memoryStates.get(id)!
  const newState = mergeMemoryStates(merge ? oldState : undefined, state)
  memoryStates.set(id, newState)

  const universe = outgoingUniverses.get(id)!

  if (newState.on)
    addUniverse(universe, {
      masterValue: newState.value,
      forceMaster: newState.forceMaster,
    })
  else removeUniverse(universe)
}

function handleApiMessage(message: ApiMemoryStateMessage) {
  forEach(message.id, id => setMemoryState(id, message.state, true))
  return true
}

function reload(reloadState?: boolean) {
  const oldMemoryStates = new Map(memoryStates)
  memoryStates.clear()

  for (const universe of outgoingUniverses.values()) {
    removeUniverse(universe)
  }
  outgoingUniverses.clear()

  masterData.memories.forEach(memory =>
    initMemory(
      memory,
      reloadState
        ? dictionaryToMap(getPersistedState().memories)
        : oldMemoryStates
    )
  )
}

export function init(): void {
  const start = Date.now()
  const persistedState = dictionaryToMap(getPersistedState().memories)
  masterData.memories.forEach(memory => initMemory(memory, persistedState))

  controlRegistry.register({ reload })
  registerApiMessageHandler('memory', handleApiMessage)

  initLiveMemories()

  howLong(start, 'initMemories')
}
