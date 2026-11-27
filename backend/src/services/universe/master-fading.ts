import {
  addFadeHandler,
  removeFadeHandler,
  startValueFade,
  stepValueFade,
  ValueFade,
} from './fading'
import { universes, universeStates } from './state'
import { Universe } from './types'
import {
  addUniverse,
  bringUniverseToFront,
  removeUniverse,
  setUniverseState,
} from './universe-functions'

/** A running fade of a universe's master value. */
interface MasterFade extends ValueFade {
  /** Time of the last fade step in ms. */
  lastTime: number

  /** Whether the universe stays active after the fade. */
  on: boolean

  forceMaster?: boolean

  /** Called after the universe was removed at the end of a fade out. */
  onFadedOut?: () => void
}

const masterFades = new Map<Universe, MasterFade>()

function stopMasterFade(universe: Universe) {
  const fade = masterFades.get(universe)
  if (!fade) return
  masterFades.delete(universe)
  removeFadeHandler(fade)
}

function processMasterFade(universe: Universe, fade: MasterFade, now: number) {
  // The universe was removed from somewhere else, e.g. when reloading
  if (!universes.has(universe)) {
    stopMasterFade(universe)
    return
  }

  const finished = stepValueFade(fade, now - fade.lastTime)
  fade.lastTime = now

  if (!finished) {
    setUniverseState(universe, {
      masterValue: Math.round(fade.current),
      forceMaster: fade.forceMaster,
    })
    return
  }

  stopMasterFade(universe)
  if (fade.on) {
    setUniverseState(universe, {
      masterValue: fade.target,
      forceMaster: fade.forceMaster,
    })
  } else {
    removeUniverse(universe)
    fade.onFadedOut?.()
  }
}

export interface UniverseOutputOptions {
  /** Whether the universe should be active (i.e. part of the outgoing DMX universe). */
  on: boolean

  /**
   * The universe's master value while active.
   *
   * Defaults to 255.
   */
  masterValue?: number

  /** See {@link UniverseState.forceMaster}. */
  forceMaster?: boolean

  /**
   * Fade time in seconds for turning the universe on/off and changing its master value.
   *
   * If a fade is already in progress, it continues from its current value.
   * It is not interrupted if the target output does not change.
   *
   * Defaults to 0.
   */
  fade?: number

  /**
   * Called after the universe was removed at the end of a fade out.
   *
   * Not called if the universe is removed immediately, or if the fade is interrupted.
   */
  onFadedOut?: () => void
}

/**
 * Adds/removes the given universe and sets its master value, optionally fading it.
 *
 * When fading out, the universe stays active until its master value reaches 0.
 *
 * @returns whether a fade is in progress.
 */
export function setUniverseOutput(
  universe: Universe,
  {
    on,
    masterValue = 255,
    forceMaster,
    fade = 0,
    onFadedOut,
  }: UniverseOutputOptions
): boolean {
  const active = universes.has(universe)
  const existing = masterFades.get(universe)
  const target = on ? masterValue : 0

  // Turning an overriding universe on again while fading out moves it on top again
  if (on && active && existing && !existing.on) bringUniverseToFront(universe)

  // Changes that do not affect the output (e.g. other state changes of the control)
  // should not interrupt a running fade
  if (
    existing &&
    active &&
    existing.on === on &&
    existing.target === target &&
    existing.forceMaster === forceMaster
  ) {
    return true
  }

  if (fade <= 0 || (!on && !active)) {
    stopMasterFade(universe)
    if (on) addUniverse(universe, { masterValue, forceMaster })
    else removeUniverse(universe)
    return false
  }

  stopMasterFade(universe)

  if (!active) addUniverse(universe, { masterValue: 0, forceMaster })

  const current =
    existing?.current ?? universeStates.get(universe)?.masterValue ?? 255

  if (target === current) {
    if (on) addUniverse(universe, { masterValue, forceMaster })
    else removeUniverse(universe)
    return false
  }

  const masterFade: MasterFade = {
    ...startValueFade(existing ?? current, target, fade),
    lastTime: Date.now(),
    on,
    forceMaster,
    onFadedOut,
  }
  masterFades.set(universe, masterFade)
  addFadeHandler(masterFade, now =>
    processMasterFade(universe, masterFade, now)
  )

  return true
}

/** Returns whether the given universe is currently active, e.g. while being faded out. */
export function isUniverseActive(universe: Universe): boolean {
  return universes.has(universe)
}
