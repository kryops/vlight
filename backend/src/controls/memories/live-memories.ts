import { getFixtureStateForMemoryScene, mapFixtureList } from '@vlight/controls'
import {
  ApiLiveMemoryMessage,
  Dictionary,
  FixtureState,
  IdType,
  LiveMemory,
} from '@vlight/types'
import { dictionaryToMap, mergeObjects } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  addUniverse,
  createUniverse,
  overwriteUniverse,
  removeUniverse,
  Universe,
} from '../../services/universe'
import { controlRegistry } from '../registry'

/** A map containing all live memories. */
export const liveMemories: Map<IdType, LiveMemory> = new Map()

/** The outgoing DMX universes for all live memories. */
const outgoingUniverses: Map<IdType, Universe> = new Map()

function getUniverseForLiveMemory(liveMemory: LiveMemory): Universe {
  const fixtureStates: Dictionary<FixtureState> = {}

  mapFixtureList(liveMemory.members, { masterData, masterDataMaps }).forEach(
    (member, memberIndex, members) => {
      fixtureStates[member] = getFixtureStateForMemoryScene(
        liveMemory,
        memberIndex,
        members
      )
    }
  )

  return createUniverse(fixtureStates)
}

function deleteLiveMemory(id: IdType) {
  liveMemories.delete(id)
  const universe = outgoingUniverses.get(id)
  if (universe) removeUniverse(universe)
  outgoingUniverses.delete(id)
}

function handleApiMessage(message: ApiLiveMemoryMessage): boolean {
  const id = message.id

  const existing = liveMemories.get(id)

  if (message.state === null) {
    deleteLiveMemory(id)
    return true
  }

  const liveMemory = message.merge
    ? mergeObjects(existing, message.state)
    : (message.state as LiveMemory)

  liveMemories.set(id, liveMemory)

  if (!existing) outgoingUniverses.set(id, getUniverseForLiveMemory(liveMemory))
  const universe = outgoingUniverses.get(id)!

  if (!liveMemory.on) {
    removeUniverse(universe)
    return true
  }

  if (
    existing &&
    (!existing.on ||
      message.state.members ||
      message.state.pattern ||
      message.state.states)
  ) {
    overwriteUniverse(universe, getUniverseForLiveMemory(liveMemory)!)
  }

  addUniverse(universe, { masterValue: liveMemory.value })

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveMemories.clear()
  ;[...outgoingUniverses.values()].forEach(removeUniverse)
  outgoingUniverses.clear()
}

export function initLiveMemories(): void {
  controlRegistry.register({ reload })
  registerApiMessageHandler('live-memory', handleApiMessage)

  for (const [id, liveMemory] of dictionaryToMap(
    getPersistedState().liveMemories
  )) {
    handleApiMessage({ type: 'live-memory', id, state: liveMemory })
  }
}
