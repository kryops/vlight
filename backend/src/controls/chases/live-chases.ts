import {
  getLiveChaseFixtureStates,
  LiveChaseProgress,
  mapFixtureMemberList,
} from '@vlight/controls'
import { ApiLiveChaseMessage, IdType, LiveChase } from '@vlight/types'
import { dictionaryToMap, logger, mergeObjects } from '@vlight/utils'

import { handleApiMessage } from '../../services/api'
import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  createUniverse,
  isUniverseActive,
  isUniverseEmpty,
  overwriteUniverse,
  removeUniverse,
  setUniverseOutput,
  Universe,
  setUniverseChannels,
  setUniverseChannelsFrom,
  setUniverseOverride,
  stopUniverseChannelFades,
} from '../../services/universe'
import { getChannelFromUniverseIndex } from '../../services/universe/utils'
import { controlRegistry } from '../registry'
import { isPaused, registerPauseHandler } from '../pause'
import {
  addAllFixturesToOverrideWeights,
  createOverrideWeights,
  getOverrideScope,
} from '../override'

/** Time in seconds by which step fades finish early (1.5 fade intervals). */
const stepFadeLeadTime = 0.03

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

  /** The progress of the chase, to be carried over to the next step. */
  progress: LiveChaseProgress

  /** The members that are active in the current step. */
  activeMembers: string[]
}

/** Changes to these properties are applied directly when the chase is turned off. */
const recomputeWhenOffKeys: (keyof LiveChase)[] = [
  'colors',
  'light',
  'colorMode',
  'colorSelection',
  'order',
  'orderDirection',
  'orderAdvance',
]

const preparedStates: Map<IdType, LiveChasePreparedState> = new Map()

/**
 * The outgoing DMX universes for all live chases.
 * Unlike the {@link LiveChasePreparedState.fullUniverse}, these universes may be faded.
 */
const outgoingUniverses: Map<IdType, Universe> = new Map()

/**
 * The override weights of the {@link outgoingUniverses}.
 * Only applied if the chase does not merge with other controls (see {@link LiveChase.mixing}).
 */
const overrideWeights: Map<IdType, Universe> = new Map()

/** Intervals to step through the chases. */
const intervals: Map<IdType, any> = new Map()

/**
 * Timeouts for applying the next step and starting an interval.
 * Used to improve the behavior when the speed is changed.
 */
const timeouts: Map<IdType, any> = new Map()

function prepareLiveChase(
  liveChase: LiveChase,
  previousState: LiveChasePreparedState | undefined,
  advance: boolean
): LiveChasePreparedState {
  const { fixtureStates, progress } = getLiveChaseFixtureStates(
    liveChase,
    { masterData, masterDataMaps },
    previousState?.progress,
    advance
  )

  return {
    fullUniverse: createUniverse(fixtureStates),
    computedTime: Date.now(),
    progress,
    activeMembers: Object.keys(fixtureStates),
  }
}

/**
 * Computes the override weights for the given active members,
 * or `null` if the chase merges with other controls.
 */
function getTargetOverrideWeights(
  liveChase: LiveChase,
  activeMembers: string[]
): Universe | null {
  const mixing = liveChase.mixing ?? 'merge'
  if (mixing === 'merge') return null

  const scope = getOverrideScope(
    liveChase.colors.flatMap(color => Object.keys(color.channels))
  )

  if (mixing === 'override') return createOverrideWeights(activeMembers, scope)

  // swop: override all fixtures, so only the chase is visible
  const members = mapFixtureMemberList(liveChase.members, {
    masterData,
    masterDataMaps,
  })
  const weights = createOverrideWeights(members, scope)
  addAllFixturesToOverrideWeights(weights, 'look')
  return weights
}

/**
 * Applies the chase's mixing mode, and directly applies the override weights
 * for the current step.
 */
function applyMixing(id: IdType) {
  const liveChase = liveChases.get(id)
  const universe = outgoingUniverses.get(id)
  const weights = overrideWeights.get(id)
  if (!liveChase || !universe || !weights) return

  const targetWeights = getTargetOverrideWeights(
    liveChase,
    preparedStates.get(id)?.activeMembers ?? []
  )
  stopUniverseChannelFades(weights)
  if (targetWeights) overwriteUniverse(weights, targetWeights)
  // swop always blacks out everything else, independent of the chase's value
  setUniverseOverride(
    universe,
    targetWeights ? weights : null,
    liveChase.mixing === 'swop'
  )
}

/** Stops all running fades of the chase's universes. */
function stopFades(id: IdType) {
  const universe = outgoingUniverses.get(id)
  if (universe) stopUniverseChannelFades(universe)
  const weights = overrideWeights.get(id)
  if (weights) stopUniverseChannelFades(weights)
}

/**
 * Computes the chase's state for the next step.
 *
 * @param advance `false` to recompute the current step after changes to the chase
 *   (only relevant for ordered selection and sequential colors)
 */
function recomputeLiveChase(id: IdType, advance = true) {
  logger.debug('recomputing live chase', id)

  const liveChase = liveChases.get(id)
  if (!liveChase) return

  const universe = outgoingUniverses.get(id)!
  const weights = overrideWeights.get(id)!
  const preparedState = prepareLiveChase(
    liveChase,
    preparedStates.get(id),
    advance
  )
  preparedStates.set(id, preparedState)
  const { fullUniverse, activeMembers } = preparedState
  const targetWeights = getTargetOverrideWeights(liveChase, activeMembers)

  // We directly apply the new state if the chase
  // - does not fade
  // - is turned off and not fading out (so the new state will be visible when turning it on again)
  // - is newly created
  if (
    liveChase.fade &&
    (liveChase.on || isUniverseActive(universe)) &&
    !isUniverseEmpty(universe)
  ) {
    // Each step fades from the current values in the full fade time,
    // finishing a bit early to reach the target when the fade time equals the step time
    const fadeOptions = {
      fade: liveChase.fade - stepFadeLeadTime,
      restart: true,
    }

    if (liveChase.mixing === 'override' && targetWeights) {
      // Inactive members keep their values while their weights fade out, so the
      // other controls show through. Members that are not visible yet jump to
      // their new values directly while their weights fade in.
      const instantValues: [number, number][] = []
      const fadedValues: [number, number][] = []
      targetWeights.forEach((weight, index) => {
        if (weight === 0) return
        const entry: [number, number] = [
          getChannelFromUniverseIndex(index),
          fullUniverse[index],
        ]
        if (weights[index] === 0) instantValues.push(entry)
        else fadedValues.push(entry)
      })
      setUniverseChannels(universe, instantValues)
      setUniverseChannels(universe, fadedValues, fadeOptions)
    } else {
      setUniverseChannelsFrom(universe, fullUniverse, fadeOptions)
    }

    if (targetWeights) {
      setUniverseChannelsFrom(weights, targetWeights, fadeOptions)
    }
  } else {
    stopFades(id)
    overwriteUniverse(universe, fullUniverse)
    if (targetWeights) overwriteUniverse(weights, targetWeights)
  }
}

/**
 * Creates an interval to step through the chase in the configured speed.
 *
 * If the chase has just been recomputed, it creates a timeout first before the
 * interval is created to improve the behavior when changing the speed.
 *
 * Does nothing while paused, the interval is added when resuming.
 */
function addInterval(id: IdType, liveChase: LiveChase) {
  removeInterval(id)
  if (isPaused()) return

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
  removeOutgoingUniverse(id)
  preparedStates.delete(id)
}

function removeOutgoingUniverse(id: IdType) {
  const universe = outgoingUniverses.get(id)
  if (universe) {
    removeUniverse(universe)
    setUniverseOverride(universe, null)
  }
  stopFades(id)
  outgoingUniverses.delete(id)
  overrideWeights.delete(id)
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

  if (!existing) {
    outgoingUniverses.set(id, createUniverse())
    overrideWeights.set(id, createUniverse())
  }
  const universe = outgoingUniverses.get(id)!

  if (!existing || message.state.mixing !== undefined) applyMixing(id)

  if (!liveChase.on) {
    const stop = () => {
      removeInterval(id)
      stopFades(id)
    }

    // The chase keeps running while fading out
    const fadingOut = setUniverseOutput(universe, {
      on: false,
      fade: message.fade,
      onFadedOut: () => {
        if (!liveChases.get(id)?.on) stop()
      },
    })
    if (!fadingOut) stop()

    // we recompute the chase here on substantial changes so they will be reflected right when it is turned on again
    if (
      message.step ||
      recomputeWhenOffKeys.some(key => message.state?.[key] !== undefined)
    ) {
      recomputeLiveChase(id, !!message.step)
    }

    return true
  }

  // Only recompute the chase here when it's new or stepped manually,
  // otherwise we would flicker lots of colors when fading, changing speed or colors
  if (isUniverseEmpty(universe) || message.step)
    recomputeLiveChase(id, !!message.step)
  setUniverseOutput(universe, {
    on: true,
    masterValue: liveChase.value,
    fade: message.fade,
  })

  if (liveChase.stopped) {
    removeInterval(id)
    // We allow fading when stepping manually.
    // For the fade from a manual step to continue when other changes are made, we only actually stop
    // fading right when the chase is stopped.
    if (!message.step && !existing?.stopped) stopFades(id)
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

function isRunning(liveChase: LiveChase) {
  return liveChase.on && !liveChase.stopped
}

function handlePauseChange(paused: boolean) {
  if (paused) {
    ;[...intervals.keys()].forEach(removeInterval)
    ;[...timeouts.keys()].forEach(removeInterval)
    return
  }

  // If the next step is already due, it is applied immediately
  for (const [id, liveChase] of liveChases) {
    const universe = outgoingUniverses.get(id)
    const fadingOut = !!universe && isUniverseActive(universe)
    if (isRunning(liveChase) || (fadingOut && !liveChase.stopped))
      addInterval(id, liveChase)
  }
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveChases.clear()
  preparedStates.clear()
  ;[...outgoingUniverses.keys()].forEach(removeOutgoingUniverse)
  ;[...intervals.keys()].forEach(removeInterval)
  ;[...timeouts.keys()].forEach(removeInterval)
}

export function initLiveChases(): void {
  controlRegistry.register({ reload })
  registerPauseHandler(handlePauseChange)
  registerApiMessageHandler('live-chase', handleLiveChaseApiMessage)

  for (const [id, liveChase] of dictionaryToMap(
    getPersistedState().liveChases
  )) {
    handleLiveChaseApiMessage({ type: 'live-chase', id, state: liveChase })
  }
}
