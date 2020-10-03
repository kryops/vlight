import { EntityArray, EntityName, EntityType, IdType } from '@vlight/types'

import { howLong } from '../../util/time'

import { JsDatabaseBackend } from './backends/js-backend'
import { DatabaseEntityOptions } from './backends/database-backend'

const backend = new JsDatabaseBackend()

export async function loadDatabaseEntity<T extends EntityName>(
  entity: T,
  options?: DatabaseEntityOptions
): Promise<EntityArray<T>> {
  return backend.loadEntities(entity, options)
}

export async function writeDatabaseEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>,
  options?: DatabaseEntityOptions
): Promise<void> {
  await backend.writeEntities(entity, entries, options)
}

export async function addDatabaseEntry<T extends EntityName>(
  entity: T,
  entry: EntityType<T>,
  options?: DatabaseEntityOptions
): Promise<void> {
  await backend.addEntry(entity, entry, options)
}

export async function updateDatabaseEntry<T extends EntityName>(
  entity: T,
  entry: EntityType<T>,
  options?: DatabaseEntityOptions
): Promise<void> {
  await backend.updateEntry(entity, entry, options)
}

export async function removeDatabaseEntry<T extends EntityName>(
  entity: T,
  id: IdType,
  options?: DatabaseEntityOptions
): Promise<void> {
  await backend.removeEntry(entity, id, options)
}

export async function initDatabase(): Promise<void> {
  const start = Date.now()
  // do nothing
  howLong(start, 'initDatabase')
}
