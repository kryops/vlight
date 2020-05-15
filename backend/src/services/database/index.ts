import { EntityArray, EntityName } from '@vlight/entities'

import { howLong } from '../../util/time'

import { JsDatabaseBackend } from './backends/js-backend'

const backend = new JsDatabaseBackend()

export async function loadDatabaseEntity<T extends EntityName>(entity: T) {
  return backend.loadEntities(entity)
}

export async function writeDatabaseEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>
) {
  await backend.writeEntities(entity, entries)
}

export async function initDatabase() {
  const start = Date.now()
  // do nothing
  howLong(start, 'initDatabase')
}
