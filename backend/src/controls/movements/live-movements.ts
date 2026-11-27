import { ChannelType, getLiveMovementFixturePositions } from '@vlight/controls'
import { ApiLiveMovementMessage, IdType, LiveMovement } from '@vlight/types'
import { dictionaryToMap, mergeObjects } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  addUniverse,
  createUniverse,
  overwriteUniverse,
  removeUniverse,
  setUniverseOverride,
  Universe,
} from '../../services/universe'
import { getUniverseIndex } from '../../services/universe/utils'
import { controlRegistry } from '../registry'
import { isPaused, registerPauseHandler } from '../pause'
import { createOverrideWeights } from '../override'

/** A map containing all live movements. */
export const liveMovements = new Map<IdType, LiveMovement>()

/**
 * The outgoing DMX universes for all live movements.
 *
 * Live movements always override the position channels of their members.
 */
const outgoingUniverses = new Map<IdType, Universe>()

/** The override weights of the {@link outgoingUniverses}. */
const overrideWeights = new Map<IdType, Universe>()

/**
 * Current phase (0-1) per live movement.
 *
 * If no phase is set, the members are positioned at the center.
 */
const phases = new Map<IdType, number>()

/** Interval time (ms) for the movement. */
const movementIntervalTime = 50

/**
 * The interval that processes all movements.
 * Only running if there are movements active.
 */
let movementInterval: any = null

/** The time of the last interval execution. */
let lastExecution = 0

function isRunning(liveMovement: LiveMovement) {
  return liveMovement.on && !liveMovement.stopped
}

/**
 * Creates a universe containing only the pan and tilt channels of the movement's members.
 *
 * We do not use fixture states here, as they would also set the master channel.
 */
function getUniverseForLiveMovement(
  id: IdType,
  liveMovement: LiveMovement
): Universe {
  const universe = createUniverse()
  const positions = getLiveMovementFixturePositions(
    liveMovement,
    phases.get(id) ?? null,
    { masterData, masterDataMaps }
  )

  for (const [fixtureId, position] of Object.entries(positions)) {
    const fixture = masterDataMaps.fixtures.get(fixtureId)
    if (!fixture) continue
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
    if (!fixtureType) continue

    const baseIndex = getUniverseIndex(fixture.channel)
    fixtureType.mapping.forEach((channelType, offset) => {
      if (channelType === ChannelType.Pan)
        universe[baseIndex + offset] = position.pan
      else if (channelType === ChannelType.Tilt) {
        universe[baseIndex + offset] = position.tilt
      }
    })
  }

  return universe
}

/** Overrides the position channels of all members. */
function updateOverrideWeights(id: IdType, liveMovement: LiveMovement) {
  const weights = overrideWeights.get(id)
  if (!weights) return
  const positions = getLiveMovementFixturePositions(liveMovement, null, {
    masterData,
    masterDataMaps,
  })
  overwriteUniverse(
    weights,
    createOverrideWeights(Object.keys(positions), 'position')
  )
}

function removeOutgoingUniverse(id: IdType) {
  const universe = outgoingUniverses.get(id)
  if (universe) {
    removeUniverse(universe)
    setUniverseOverride(universe, null)
  }
  outgoingUniverses.delete(id)
  overrideWeights.delete(id)
}

function recomputeLiveMovement(id: IdType, liveMovement: LiveMovement) {
  const universe = outgoingUniverses.get(id)
  if (universe) {
    overwriteUniverse(universe, getUniverseForLiveMovement(id, liveMovement))
  }
}

function processMovements() {
  const now = Date.now()
  const elapsedSeconds = (now - lastExecution) / 1000
  lastExecution = now

  for (const [id, liveMovement] of liveMovements) {
    if (!isRunning(liveMovement)) continue

    const oldPhase = phases.get(id) ?? 0
    const newPhase =
      (oldPhase + elapsedSeconds / Math.max(liveMovement.speed, 0.01)) % 1
    phases.set(id, newPhase)

    recomputeLiveMovement(id, liveMovement)
  }
}

function refreshMovementInterval() {
  const hasRunningMovements =
    !isPaused() && [...liveMovements.values()].some(isRunning)

  if (hasRunningMovements && !movementInterval) {
    lastExecution = Date.now()
    movementInterval = setInterval(processMovements, movementIntervalTime)
  } else if (!hasRunningMovements && movementInterval) {
    clearInterval(movementInterval)
    movementInterval = null
  }
}

function deleteLiveMovement(id: IdType) {
  liveMovements.delete(id)
  removeOutgoingUniverse(id)
  phases.delete(id)
  refreshMovementInterval()
}

function handleApiMessage(message: ApiLiveMovementMessage): boolean {
  const id = message.id

  const existing = liveMovements.get(id)

  if (message.state === null) {
    deleteLiveMovement(id)
    return true
  }

  const liveMovement = message.merge
    ? mergeObjects(existing, message.state)
    : (message.state as LiveMovement)

  liveMovements.set(id, liveMovement)

  if (message.reset) phases.delete(id)

  refreshMovementInterval()

  if (!existing) {
    const universe = createUniverse()
    const weights = createUniverse()
    setUniverseOverride(universe, weights)
    outgoingUniverses.set(id, universe)
    overrideWeights.set(id, weights)
  }
  const universe = outgoingUniverses.get(id)!
  updateOverrideWeights(id, liveMovement)

  // We always recompute so changes are reflected immediately,
  // and when turning the movement on again
  recomputeLiveMovement(id, liveMovement)

  if (liveMovement.on) addUniverse(universe)
  else removeUniverse(universe)

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) {
    // master data may have changed
    for (const [id, liveMovement] of liveMovements) {
      updateOverrideWeights(id, liveMovement)
      recomputeLiveMovement(id, liveMovement)
    }
    return
  }

  liveMovements.clear()
  ;[...outgoingUniverses.keys()].forEach(removeOutgoingUniverse)
  phases.clear()

  refreshMovementInterval()
}

export function initLiveMovements(): void {
  controlRegistry.register({ reload })
  registerPauseHandler(refreshMovementInterval)
  registerApiMessageHandler('live-movement', handleApiMessage)

  for (const [id, liveMovement] of dictionaryToMap(
    getPersistedState().liveMovements
  )) {
    handleApiMessage({ type: 'live-movement', id, state: liveMovement })
  }
}
