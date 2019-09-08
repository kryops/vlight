import { MemoryState, Memory, IdType } from '@vlight/entities'

import { memories } from '../../database'
import { getPersistedState } from '../../database/state'
import {
  Universe,
  createUniverse,
  addUniverse,
  removeUniverse,
  setUniverseChannel,
  getUniverseIndex,
} from '../../services/universe'
import { logWarn } from '../../util/log'
import { dictionaryToMap } from '../../util/map'
import { howLong } from '../../util/time'

import {
  getInitialMemoryState,
  mapMemoryStateToChannelValue,
  createFullUniverse,
  getAffectedChannels,
} from './mapping'

const outgoingUniverses: Map<IdType, Universe> = new Map()
const fullUniverses: Map<IdType, Universe> = new Map()
const affectedChannels: Map<IdType, number[]> = new Map()
export const memoryStates: Map<IdType, MemoryState> = new Map()

function initMemory(memory: Memory, oldMemoryStates: Map<IdType, MemoryState>) {
  const { id } = memory
  const universe = createUniverse()
  outgoingUniverses.set(id, universe)

  const fullUniverse = createFullUniverse(memory)
  fullUniverses.set(id, fullUniverse)
  affectedChannels.set(id, getAffectedChannels(fullUniverse))

  const initialState = oldMemoryStates.get(id) || getInitialMemoryState()

  if (initialState.on) addUniverse(universe)

  memoryStates.set(id, initialState)
  setMemoryStateToUniverse(memory, initialState)
}

function setMemoryStateToUniverse(memory: Memory, state: MemoryState): boolean {
  const universe = outgoingUniverses.get(memory.id)
  const fullUniverse = fullUniverses.get(memory.id)
  const channels = affectedChannels.get(memory.id)
  if (!universe || !fullUniverse || !channels) return false

  let changed = false

  for (const channel of channels) {
    const fullValue = fullUniverse[getUniverseIndex(channel)]
    if (
      setUniverseChannel(
        universe,
        channel,
        mapMemoryStateToChannelValue(fullValue, state)
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
  fullUniverses.clear()
  affectedChannels.clear()

  memories.forEach(memory => initMemory(memory, oldMemoryStates))
}
