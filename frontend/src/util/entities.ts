import { EntityType } from '@vlight/types'
import { LiveChase, LiveMemory, LiveMovement } from '@vlight/types/entities'

/**
 * Returns the display name of a master data entry
 * (its name, or its label for programmable buttons).
 */
export function getEntityName(entry: EntityType): string | undefined {
  if ('name' in entry) return entry.name
  if ('label' in entry) return entry.label
  return undefined
}

/**
 * Returns a copy of the given master data entry with an empty ID
 * and its name marked as copy.
 */
export function copyEntity<T extends EntityType>(entry: T): T {
  const copy = { ...entry, id: '' }
  if ('name' in copy && copy.name) copy.name = `${copy.name} (copy)`
  else if ('label' in copy && copy.label) copy.label = `${copy.label} (copy)`
  return copy
}

/** Returns the display title of a live memory. */
export function getLiveMemoryTitle(id: string, liveMemory: LiveMemory): string {
  return liveMemory.name ?? `Live Memory ${id}`
}

/** Returns the display title of a live chase. */
export function getLiveChaseTitle(id: string, liveChase: LiveChase): string {
  return liveChase.name ?? `Live Chase ${id}`
}

/** Returns the display title of a live movement. */
export function getLiveMovementTitle(
  id: string,
  liveMovement: LiveMovement
): string {
  return liveMovement.name ?? `Movement ${id}`
}
