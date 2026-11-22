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
import {
  deepEqual,
  dictionaryToMap,
  mergeObjects,
  overflowBetween,
} from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  addFadeHandler,
  createUniverse,
  isUniverseActive,
  mixUniverses,
  overwriteUniverse,
  removeFadeHandler,
  removeUniverse,
  setUniverseOutput,
  Universe,
} from '../../services/universe'
import { controlRegistry } from '../registry'
import { isPaused, registerPauseHandler } from '../pause'

/** A map containing all live memories. */
export const liveMemories = new Map<IdType, LiveMemory>()

/** The outgoing DMX universes for all live memories. */
const outgoingUniverses = new Map<IdType, Universe>()

/** Current gradient movement offsets (0-1) per live memory. */
const gradientMovementOffsets = new Map<IdType, number>()

/**
 * A running crossfade between two base states of a live memory.
 *
 * Both states are rendered with the current gradient movement offset,
 * so moving gradients keep moving while crossfading.
 */
interface LiveMemoryCrossfade {
  /** Renders the state that is faded from. */
  renderFrom: () => Universe

  /**
   * The base state that is faded from.
   *
   * Not set if fading from another crossfade.
   * Used to reverse the crossfade when fading back to it.
   */
  fromState?: LiveMemory

  /** The number of nested crossfades in {@link renderFrom}. */
  depth: number

  /** Progress from 0 to 1. */
  progress: number

  /** Progress per ms. */
  speed: number

  /** Time of the last fade step in ms. */
  lastTime: number
}

/** Running crossfades per live memory. */
const crossfades = new Map<IdType, LiveMemoryCrossfade>()

/** Maximum number of nested crossfades before the state faded from is frozen. */
const maxCrossfadeDepth = 3

/** Keys of a live memory that affect its universe (excluding the gradient movement). */
const baseStateKeys = [
  'members',
  'pattern',
  'states',
  'order',
  'gradientIgnoreFixtureOffset',
] as const

function hasSameBaseState(a: LiveMemory, b: LiveMemory) {
  return baseStateKeys.every(key => deepEqual(a[key], b[key]))
}

/** Interval time (ms) for the gradient movement */
const gradientIntervalTime = 20

/**
 * The interval that processes all movements.
 * Only running if there are movements active.
 */
let gradientInterval: any = null

function hasMovingGradient(id: IdType, liveMemory: LiveMemory) {
  const universe = outgoingUniverses.get(id)
  return (
    // keep moving while fading out
    (liveMemory.on || (!!universe && isUniverseActive(universe))) &&
    !!liveMemory.gradientMovement &&
    liveMemory.states.some(state => Array.isArray(state))
    // we don't check for gradientSpeed here, as we fall back to a default value if not set
  )
}

function processMovingGradients() {
  for (const [id, liveMemory] of liveMemories) {
    if (!hasMovingGradient(id, liveMemory)) continue

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
      overwriteUniverse(universe, getOutputUniverse(id, liveMemory))
    }
  }
}

function refreshGradientInterval() {
  const hasMovingGradients =
    !isPaused() &&
    [...liveMemories].some(([id, liveMemory]) =>
      hasMovingGradient(id, liveMemory)
    )

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
  const memberFixtures = members.map(member =>
    masterDataMaps.fixtures.get(member)!
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

/**
 * Returns the universe for the current state of the live memory,
 * including a running crossfade.
 */
function getOutputUniverse(id: IdType, liveMemory: LiveMemory): Universe {
  const target = getUniverseForLiveMemory(id, liveMemory)
  const crossfade = crossfades.get(id)
  return crossfade
    ? mixUniverses(crossfade.renderFrom(), target, crossfade.progress)
    : target
}

function stopCrossfade(id: IdType) {
  const crossfade = crossfades.get(id)
  if (!crossfade) return
  crossfades.delete(id)
  removeFadeHandler(crossfade)
}

function processCrossfade(
  id: IdType,
  crossfade: LiveMemoryCrossfade,
  now: number
) {
  crossfade.progress = Math.min(
    crossfade.progress + crossfade.speed * (now - crossfade.lastTime),
    1
  )
  crossfade.lastTime = now
  if (crossfade.progress === 1) stopCrossfade(id)

  const liveMemory = liveMemories.get(id)
  const universe = outgoingUniverses.get(id)
  if (!liveMemory || !universe) {
    stopCrossfade(id)
    return
  }

  // moving gradients are written by the gradient interval
  if (crossfade.progress === 1 || !hasMovingGradient(id, liveMemory)) {
    overwriteUniverse(universe, getOutputUniverse(id, liveMemory))
  }
}

/**
 * Starts crossfading the live memory from the previous to its current base state.
 *
 * If a crossfade is already running, it is faded from its current mix,
 * or reversed when fading back to the state it started from.
 */
function startCrossfade(id: IdType, previous: LiveMemory, fade: number) {
  const existing = crossfades.get(id)
  const liveMemory = liveMemories.get(id)!
  stopCrossfade(id)

  const base = { speed: 1 / (fade * 1000), lastTime: Date.now() }
  let crossfade: LiveMemoryCrossfade

  if (existing?.fromState && hasSameBaseState(existing.fromState, liveMemory)) {
    crossfade = {
      ...base,
      renderFrom: () => getUniverseForLiveMemory(id, previous),
      fromState: previous,
      depth: 0,
      progress: 1 - existing.progress,
    }
  } else if (existing) {
    const { renderFrom, progress, depth } = existing
    const renderMix = () =>
      mixUniverses(
        renderFrom(),
        getUniverseForLiveMemory(id, previous),
        progress
      )
    // freeze deeply nested crossfades to keep the computation cheap
    const frozen = depth + 1 >= maxCrossfadeDepth ? renderMix() : undefined
    crossfade = {
      ...base,
      renderFrom: frozen ? () => frozen : renderMix,
      depth: frozen ? 0 : depth + 1,
      progress: 0,
    }
  } else {
    crossfade = {
      ...base,
      renderFrom: () => getUniverseForLiveMemory(id, previous),
      fromState: previous,
      depth: 0,
      progress: 0,
    }
  }

  crossfades.set(id, crossfade)
  addFadeHandler(crossfade, now => processCrossfade(id, crossfade, now))
}

function deleteLiveMemory(id: IdType) {
  liveMemories.delete(id)
  stopCrossfade(id)
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

  const updatingBaseState =
    (message.state.members ||
      message.state.pattern ||
      message.state.states ||
      message.state.order ||
      message.state.gradientIgnoreFixtureOffset !== undefined) &&
    (!existing || !hasSameBaseState(existing, liveMemory))

  if (!existing) {
    outgoingUniverses.set(id, getUniverseForLiveMemory(id, liveMemory))
  }
  const universe = outgoingUniverses.get(id)!

  if (existing && updatingBaseState) {
    // also faded while turned off, as it might still be fading out
    if (message.fade && message.fade > 0 && isUniverseActive(universe)) {
      // the gradient movement continues from its current position
      startCrossfade(id, existing, message.fade)
    } else {
      stopCrossfade(id)
      gradientMovementOffsets.delete(id)
    }
  }

  if (existing && (updatingBaseState || (!existing.on && liveMemory.on))) {
    overwriteUniverse(universe, getOutputUniverse(id, liveMemory))
  }

  if (!liveMemory.on) {
    setUniverseOutput(universe, {
      on: false,
      fade: message.fade,
      onFadedOut: refreshGradientInterval,
    })
    refreshGradientInterval()
    return true
  }

  setUniverseOutput(universe, {
    on: true,
    masterValue: liveMemory.value,
    fade: message.fade,
  })
  refreshGradientInterval()

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveMemories.clear()
  ;[...crossfades.keys()].forEach(stopCrossfade)
  ;[...outgoingUniverses.values()].forEach(removeUniverse)
  outgoingUniverses.clear()

  refreshGradientInterval()
}

export function initLiveMemories(): void {
  controlRegistry.register({ reload })
  registerPauseHandler(refreshGradientInterval)
  registerApiMessageHandler('live-memory', handleApiMessage)

  for (const [id, liveMemory] of dictionaryToMap(
    getPersistedState().liveMemories
  )) {
    handleApiMessage({ type: 'live-memory', id, state: liveMemory })
  }
}
