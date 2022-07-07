import { getLiveChaseFixtureStates } from '@vlight/controls'
import { ApiLiveChaseMessage, IdType, LiveChase } from '@vlight/types'
import { dictionaryToMap, logger, mergeObjects } from '@vlight/utils'

import { handleApiMessage } from '../../services/api'
import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  addUniverse,
  createUniverse,
  fadeUniverse,
  isUniverseEmpty,
  overwriteUniverse,
  removeUniverse,
  stopFading,
  Universe,
} from '../../services/universe'
import { controlRegistry } from '../registry'

/** A map containing all defined live chases. */
export const liveChases: Map<IdType, LiveChase> = new Map()

interface LiveChasePreparedState {
  /** The computed DMX universe state for the current step. */
  fullUniverse: Universe

  /**
   * The time this state was computed.
   * Used to improve the behavior when the speed is changed.
   */
  computedTime: number
}

const preparedStates: Map<IdType, LiveChasePreparedState> = new Map()

/**
 * The outgoing DMX universes for all live chases.
 * Unlike the {@link LiveChasePreparedState.fullUniverse}, these universes may be faded.
 */
const outgoingUniverses: Map<IdType, Universe> = new Map()

/** Intervals to step through the chases. */
const intervals: Map<IdType, any> = new Map()

/**
 * Timeouts for applying the next step and starting an interval.
 * Used to improve the behavior when the speed is changed.
 */
const timeouts: Map<IdType, any> = new Map()

function prepareLiveChase(liveChase: LiveChase): LiveChasePreparedState {
  const fixtureStates = getLiveChaseFixtureStates(liveChase, {
    masterData,
    masterDataMaps,
  })

  return {
    fullUniverse: createUniverse(fixtureStates),
    computedTime: Date.now(),
  }
}

function recomputeLiveChase(id: IdType) {
  logger.debug('recomputing live chase', id)

  const liveChase = liveChases.get(id)
  if (!liveChase) return

  const universe = outgoingUniverses.get(id)!
  const preparedState = prepareLiveChase(liveChase)!
  preparedStates.set(id, preparedState)

  // We directly apply the new state if the chase
  // - does not fade
  // - is turned off (so the new state will be visible when turning it on again)
  // - is newly created
  if (liveChase.fade && liveChase.on && !isUniverseEmpty(universe)) {
    fadeUniverse(universe, preparedState.fullUniverse, liveChase.fade * 1000)
  } else {
    stopFading(universe)
    overwriteUniverse(universe, preparedState.fullUniverse)
  }
}

/**
 * Creates an interval to step through the chase in the configured speed.
 *
 * If the chase has just been recomputed, it creates a timeout first before the
 * interval is created to improve the behavior when changing the speed.
 */
function addInterval(id: IdType, liveChase: LiveChase) {
  removeInterval(id)

  const execute = () => {
    timeouts.delete(id)
    recomputeLiveChase(id)

    const interval = setInterval(
      () => recomputeLiveChase(id),
      // max speed: 25 fps
      Math.max(liveChase.speed * 1000, 40)
    )

    intervals.set(id, interval)
  }

  const lastExecution = preparedStates.get(id)?.computedTime ?? Date.now()
  const nextExecution = lastExecution + liveChase.speed * 1000
  const timeToNextExecution = nextExecution - Date.now()
  if (timeToNextExecution < 0) execute()
  else timeouts.set(id, setTimeout(execute, timeToNextExecution))
}

/** Removes the interval and/or timeout for the given chase. */
function removeInterval(id: IdType) {
  const existingInterval = intervals.get(id)
  if (existingInterval) clearInterval(existingInterval)
  intervals.delete(id)

  const existingTimeout = timeouts.get(id)
  if (existingTimeout) clearTimeout(existingTimeout)
  timeouts.delete(id)
}

function stopAndturnOffLiveChase(id: string) {
  handleApiMessage({
    type: 'live-chase',
    id,
    state: {
      on: false,
      stopped: true,
    },
    merge: true,
  })
}

function deleteLiveChase(id: IdType) {
  liveChases.delete(id)
  removeInterval(id)
  const universe = outgoingUniverses.get(id)
  if (universe) {
    removeUniverse(universe)
    stopFading(universe)
  }
  outgoingUniverses.delete(id)
  preparedStates.delete(id)
}

function handleLiveChaseApiMessage(message: ApiLiveChaseMessage): boolean {
  const id = message.id

  const existing = liveChases.get(id)

  if (message.state === null) {
    deleteLiveChase(id)
    return true
  }

  const liveChase = message.merge
    ? mergeObjects(existing, message.state)
    : (message.state as LiveChase)

  liveChases.set(id, liveChase)

  if (!existing) outgoingUniverses.set(id, createUniverse())
  const universe = outgoingUniverses.get(id)!

  if (!liveChase.on) {
    removeInterval(id)
    removeUniverse(universe)
    stopFading(universe)

    // we recompute the chase here on substantial changes so they will be reflected right when it is turned on again
    if (
      message.step ||
      message.state.colors !== undefined ||
      message.state.light !== undefined
    ) {
      recomputeLiveChase(id)
    }

    return true
  }

  // Only recompute the chase here when it's new or stepped manually,
  // otherwise we would flicker lots of colors when fading, changing speed or colors
  if (isUniverseEmpty(universe) || message.step) recomputeLiveChase(id)
  addUniverse(universe, { masterValue: liveChase.value })

  if (liveChase.stopped) {
    removeInterval(id)
    // We allow fading when stepping manually.
    // For the fade from a manual step to continue when other changes are made, we only actually stop
    // fading right when the chase is stopped.
    if (!message.step && !existing?.stopped) stopFading(universe)
  } else if (
    !existing?.on ||
    existing?.stopped ||
    existing?.speed !== liveChase.speed ||
    // re-align existing interval with step tap
    message.step
  ) {
    addInterval(id, liveChase)
  }

  // Single mode: stop and turn off all other single mode chases when starting this one
  if (
    liveChase.single &&
    !liveChase.burst &&
    ((!existing?.on && liveChase.on) ||
      (existing?.stopped && !liveChase.stopped))
  ) {
    for (const [otherId, otherChase] of liveChases.entries()) {
      if (otherId !== id && otherChase.single && otherChase.on) {
        stopAndturnOffLiveChase(otherId)
      }
    }
  }

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveChases.clear()
  preparedStates.clear()
  ;[...outgoingUniverses.values()].forEach(universe => {
    stopFading(universe)
    removeUniverse(universe)
  })
  outgoingUniverses.clear()
  ;[...intervals.keys()].forEach(removeInterval)
  ;[...timeouts.keys()].forEach(removeInterval)
}

export function initLiveChases(): void {
  controlRegistry.register({ reload })
  registerApiMessageHandler('live-chase', handleLiveChaseApiMessage)

  for (const [id, liveChase] of dictionaryToMap(
    getPersistedState().liveChases
  )) {
    handleLiveChaseApiMessage({ type: 'live-chase', id, state: liveChase })
  }
}
