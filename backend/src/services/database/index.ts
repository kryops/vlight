import { EntityArray, EntityName } from '@vlight/entities'

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

export async function initDatabase(): Promise<void> {
  const start = Date.now()
  // do nothing
  howLong(start, 'initDatabase')
}
