import {
  MemoryState,
  Memory,
  IdType,
  ApiMemoryStateMessage,
} from '@vlight/types'
import { dictionaryToMap, logger, forEach } from '@vlight/utils'
import { mergeMemoryStates } from '@vlight/controls'

import { masterDataMaps, masterData } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  Universe,
  createUniverse,
  addUniverse,
  removeUniverse,
  setUniverseChannel,
} from '../../services/universe'
import { howLong } from '../../util/time'
import { controlRegistry } from '../registry'
import { registerApiMessageHandler } from '../../services/api/registry'

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

function setMemoryState(
  id: IdType,
  state: Partial<MemoryState>,
  merge = false
): boolean {
  const memory = masterDataMaps.memories.get(id)
  if (!memory) {
    logger.warn('no memory found for ID', id)
    return false
  }
  const oldState = memoryStates.get(id)!
  const newState = mergeMemoryStates(merge ? oldState : undefined, state)
  memoryStates.set(id, newState)

  const universe = outgoingUniverses.get(id)!

  if (!oldState.on && newState.on) addUniverse(universe)
  else if (oldState.on && !newState.on) removeUniverse(universe)

  return setMemoryStateToUniverse(memory, newState)
}

function handleApiMessage(message: ApiMemoryStateMessage) {
  forEach(message.id, id => setMemoryState(id, message.state))
  return true
}

function reload(reloadState?: boolean) {
  const oldMemoryStates = new Map(memoryStates)
  memoryStates.clear()

  for (const universe of outgoingUniverses.values()) {
    removeUniverse(universe)
  }
  outgoingUniverses.clear()
  preparedStates.clear()

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

  howLong(start, 'initMemories')
}
