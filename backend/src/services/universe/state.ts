import { Universe, UniverseState } from './types'
import { createUniverse } from './universe-functions'

export const dmxUniverse = createUniverse()

export const universes = new Set<Universe>()
export const universeStates = new Map<Universe, UniverseState>()
