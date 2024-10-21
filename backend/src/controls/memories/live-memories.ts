import {
  getFixtureStateForMemoryScene,
  mapFixtureList,
  getMemorySceneStateInfo,
  defaultLiveMemoryGradientSpeed,
} from '@vlight/controls'
import {
  ApiLiveMemoryMessage,
  Dictionary,
  FixtureState,
  IdType,
  LiveMemory,
} from '@vlight/types'
import { dictionaryToMap, mergeObjects, overflowBetween } from '@vlight/utils'

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
export const liveMemories = new Map<IdType, LiveMemory>()

/** The outgoing DMX universes for all live memories. */
const outgoingUniverses = new Map<IdType, Universe>()

/** Current gradient movement offsets (0-1) per live memory. */
const gradientMovementOffsets = new Map<IdType, number>()

/** Interval time (ms) for the gradient movement */
const gradientIntervalTime = 20

/**
 * The interval that processes all movements.
 * Only running if there are movements active.
 */
let gradientInterval: any = null

function hasMovingGradient(liveMemory: LiveMemory) {
  return (
    liveMemory.on &&
    !!liveMemory.gradientMovement &&
    liveMemory.states.some(state => Array.isArray(state))
    // we don't check for gradientSpeed here, as we fall back to a default value if not set
  )
}

function processMovingGradients() {
  for (const [id, liveMemory] of liveMemories) {
    if (!hasMovingGradient(liveMemory)) continue

    const oldOffset = gradientMovementOffsets.get(id) ?? 0
    const diff =
      1 /
      (liveMemory.gradientSpeed ?? defaultLiveMemoryGradientSpeed) /
      (1000 / gradientIntervalTime)
    const newOffset = overflowBetween(
      oldOffset + (liveMemory.gradientMovementInverted ? diff * -1 : diff),
      0,
      1
    )
    gradientMovementOffsets.set(id, newOffset)

    const universe = outgoingUniverses.get(id)
    if (universe) {
      overwriteUniverse(universe, getUniverseForLiveMemory(id, liveMemory))
    }
  }
}

function refreshGradientInterval() {
  const hasMovingGradients = [...liveMemories.values()].some(hasMovingGradient)

  if (hasMovingGradients && !gradientInterval) {
    gradientInterval = setInterval(processMovingGradients, gradientIntervalTime)
  } else if (!hasMovingGradients && gradientInterval) {
    clearInterval(gradientInterval)
    gradientInterval = null
  }
}

function getUniverseForLiveMemory(
  id: IdType,
  liveMemory: LiveMemory
): Universe {
  const fixtureStates: Dictionary<FixtureState> = {}

  const members = mapFixtureList(liveMemory.members, {
    masterData,
    masterDataMaps,
  })
  const memberFixtures = members.map(
    member => masterDataMaps.fixtures.get(member)!
  )
  const stateInfo = getMemorySceneStateInfo(liveMemory, memberFixtures)
  const gradientOffset = gradientMovementOffsets.get(id)

  members.forEach((member, memberIndex) => {
    fixtureStates[member] = getFixtureStateForMemoryScene({
      scene: liveMemory,
      memberIndex,
      memberFixtures,
      stateInfo,
      gradientOffset,
      gradientIgnoreFixtureOffset: liveMemory.gradientIgnoreFixtureOffset,
    })
  })

  return createUniverse(fixtureStates)
}

function deleteLiveMemory(id: IdType) {
  liveMemories.delete(id)
  const universe = outgoingUniverses.get(id)
  if (universe) removeUniverse(universe)
  outgoingUniverses.delete(id)
  gradientMovementOffsets.delete(id)
  refreshGradientInterval()
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

  refreshGradientInterval()

  const updatingBaseState =
    message.state.members ||
    message.state.pattern ||
    message.state.states ||
    message.state.order ||
    message.state.gradientIgnoreFixtureOffset !== undefined

  if (updatingBaseState) {
    gradientMovementOffsets.delete(id)
  }

  if (!existing) {
    outgoingUniverses.set(id, getUniverseForLiveMemory(id, liveMemory))
  }
  const universe = outgoingUniverses.get(id)!

  if (!liveMemory.on) {
    removeUniverse(universe)
    return true
  }

  if (existing && (!existing.on || updatingBaseState)) {
    overwriteUniverse(universe, getUniverseForLiveMemory(id, liveMemory)!)
  }

  addUniverse(universe, { masterValue: liveMemory.value })

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveMemories.clear()
  ;[...outgoingUniverses.values()].forEach(removeUniverse)
  outgoingUniverses.clear()

  refreshGradientInterval()
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
