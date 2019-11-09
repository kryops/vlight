import { MemoryState, Memory, IdType } from '@vlight/entities'

import { memories } from '../../database'
import { getPersistedState } from '../../database/state'
import {
  Universe,
  createUniverse,
  addUniverse,
  removeUniverse,
  setUniverseChannel,
} from '../../services/universe'
import { logWarn } from '../../util/log'
import { dictionaryToMap } from '../../util/map'
import { howLong } from '../../util/time'

import {
  getInitialMemoryState,
  MemoryPreparedState,
  createPreparedState,
  mapMemoryStateToChannel,
} from './mapping'

const outgoingUniverses: Map<IdType, Universe> = new Map()
const preparedStates: Map<IdType, MemoryPreparedState> = new Map()
export const memoryStates: Map<IdType, MemoryState> = new Map()

function initMemory(memory: Memory, oldMemoryStates: Map<IdType, MemoryState>) {
  const { id } = memory
  const universe = createUniverse()
  outgoingUniverses.set(id, universe)

  const preparedState = createPreparedState(memory)
  preparedStates.set(id, preparedState)

  const initialState = oldMemoryStates.get(id) ?? getInitialMemoryState()

  if (initialState.on) addUniverse(universe)

  memoryStates.set(id, initialState)
  setMemoryStateToUniverse(memory, initialState)
}

function setMemoryStateToUniverse(memory: Memory, state: MemoryState): boolean {
  const universe = outgoingUniverses.get(memory.id)
  const preparedState = preparedStates.get(memory.id)
  if (!universe || !preparedState) return false

  let changed = false

  for (const channel of preparedState.affectedChannels) {
    if (
      setUniverseChannel(
        universe,
        channel,
        mapMemoryStateToChannel(preparedState, state, channel)
      )
    ) {
      changed = true
    }
  }

  return changed
}

export function initMemories() {
  const start = Date.now()
  const persistedState = dictionaryToMap(getPersistedState().memories)
  memories.forEach(memory => initMemory(memory, persistedState))
  howLong(start, 'initMemories')
}

export function setMemoryState(id: IdType, state: MemoryState): boolean {
  const memory = memories.get(id)
  if (!memory) {
    logWarn('no memory found for ID', id)
    return false
  }
  const oldState = memoryStates.get(id)!
  memoryStates.set(id, state)

  const universe = outgoingUniverses.get(id)!

  if (!oldState.on && state.on) addUniverse(universe)
  else if (oldState.on && !state.on) removeUniverse(universe)

  return setMemoryStateToUniverse(memory, state)
}

export function reloadMemories() {
  const oldMemoryStates = new Map(memoryStates)
  memoryStates.clear()

  for (const universe of outgoingUniverses.values()) {
    removeUniverse(universe)
  }
  outgoingUniverses.clear()
  preparedStates.clear()

  memories.forEach(memory => initMemory(memory, oldMemoryStates))
}