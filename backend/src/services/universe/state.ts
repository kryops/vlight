import { Universe, UniverseState } from './types'
import { createUniverse } from './universe-functions'

export const dmxMasterState = {
  /** Global DMX master value. */
  value: 255,

  /** DMX master fade time in seconds. */
  fade: 0,
}

/**
 * The highest values of all universes that do not override other universes
 * (see {@link overrideWeights}), before applying overrides.
 */
export const baseDmxUniverse = createUniverse()

/**
 * The raw outgoing DMX universe (overrides applied, global DMX master not applied).
 */
export const rawDmxUniverse = createUniverse()

/**
 * The outgoing DMX universe with the global DMX master applied.
 */
export const dmxUniverseAfterMaster = createUniverse()

/**
 * The outgoing DMX universe (global DMX master and fading applied).
 */
export const dmxUniverse = createUniverse()

/**
 * All active universes that together make up the outgoing DMX universe.
 *
 * Usually every control entry (e.g. a memory) would create its own universe.
 * Some controls like channels and fixtures use a single universe.
 *
 * The outgoing DMX universe is computed as follows:
 * - Each universe's state in {@link universeStates} is applied to the raw values of its channels.
 * - Channel values that depend on a fixture master channel are faded down if the fixture's master channel
 *   has a higher value in a different universe.
 * - The highest value of a channel across all non-overriding universes is set as base value.
 * - The overriding universes are blended on top in the order of their activation
 *   (see {@link overrideWeights}).
 */
export const universes = new Set<Universe>()

/** The states of all {@link universes}. */
export const universeStates = new Map<Universe, UniverseState>()

/**
 * Override weights (0-255 per channel) of all universes that override other universes
 * instead of being merged with them.
 *
 * Overriding universes are blended on top of the merged non-overriding universes, in the order
 * in which they were activated. The blend factor of each channel is its weight multiplied
 * by the universe's master value.
 */
export const overrideWeights = new Map<Universe, Universe>()

/** The universes that the {@link overrideWeights} universes belong to. */
export const overrideWeightOwners = new Map<Universe, Universe>()

/**
 * Overriding universes whose master value dims their own values
 * (like for merged universes) instead of crossfading with the universes below.
 */
export const overridesDimmedByMaster = new Set<Universe>()

/** All active overriding universes in the order of their activation. */
export const activeOverrides: Universe[] = []
