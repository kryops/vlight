import { EntityArray, EntityName } from '@vlight/entities'

import { logError } from '../../util/log'
import { howLong } from '../../util/time'

import { initEntities, writeEntity } from './access'

export * from '../masterdata'

export async function initDatabase() {
  const start = Date.now()
  await initEntities()
  howLong(start, 'initDatabase')
}

export async function reloadDatabase() {
  try {
    await initEntities()
  } catch (error) {
    logError(
      'Error reloading database, the update may have only been partial!',
      error
    )
  }
}

export async function modifyEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>
) {
  await writeEntity(entity, entries)
}
