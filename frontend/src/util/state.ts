import { Dictionary } from '@vlight/types'

export function isAnyOn(state: Dictionary<{ on: boolean }>): boolean {
  return Object.values(state).some(entry => entry.on)
}

export function isAllOn(state: Dictionary<{ on: boolean }>): boolean {
  return Object.values(state).every(entry => entry.on)
}
