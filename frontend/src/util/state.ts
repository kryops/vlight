import { Dictionary } from '@vlight/types'

/**
 * Returns whether any of the given states have their `on` property set.
 */
export function isAnyOn(state: Dictionary<{ on: boolean }>): boolean {
  return Object.values(state).some(entry => entry.on)
}

/**
 * Returns whether all of the given states have their `on` property set.
 */
export function isAllOn(state: Dictionary<{ on: boolean }>): boolean {
  return Object.values(state).every(entry => entry.on)
}
