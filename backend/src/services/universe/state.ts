import { Universe, UniverseState } from './types'
import { createUniverse } from './universe-functions'

/**
 * The raw outgoing DMX universe (global DMX master not applied).
 */
export const rawDmxUniverse = createUniverse()

/**
 * The outgoing DMX universe (global DMX master applied).
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
 * - The highest value of a channel across all universes is set as outgoing value.
 */
export const universes = new Set<Universe>()

/** The states of all {@link universes}. */
export const universeStates = new Map<Universe, UniverseState>()
