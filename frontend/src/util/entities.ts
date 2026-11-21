import { EntityType } from '@vlight/types'

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
