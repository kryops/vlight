import { EntityName, EntityArray } from '@vlight/entities'

import { broadcastApplicationStateToSockets } from '../api'
import { reloadDatabase, modifyEntity } from '../database'
import { reloadControls } from '../controls'
import { logInfo } from '../util/log'

export async function reloadMasterData() {
  logInfo('Reloading master data')
  reloadDatabase()
  reloadControls()
  broadcastApplicationStateToSockets()
}

export async function updateMasterDataEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>
) {
  logInfo(`Updating "${entity}"`)
  await modifyEntity(entity, entries)
  reloadControls()
  broadcastApplicationStateToSockets()
}
