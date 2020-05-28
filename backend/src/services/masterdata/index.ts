import { EntityName, EntityArray, MasterData } from '@vlight/entities'
import { ApiEntityMessage } from '@vlight/api'

import { reloadControls } from '../../controls'
import { logInfo } from '../../util/log'
import { writeDatabaseEntity, loadDatabaseEntity } from '../database'
import { broadcastApplicationStateToApiClients } from '../api'
import { registerApiMessageHandler } from '../api/registry'
import { howLong } from '../../util/time'

import { initMasterDataEntities } from './entities'
import {
  getEntitiesInDependencyOrder,
  getAffectedEntities,
} from './dependencies'
import { getMasterDataEntityDefinition } from './registry'
import { masterData, rawMasterData, masterDataMaps } from './data'

async function loadMasterDataEntity<T extends EntityName>(entity: T) {
  const definition = getMasterDataEntityDefinition(entity)

  const global = !!definition?.global

  const rawEntries = await loadDatabaseEntity(entity, { global })

  const preprocessor = definition?.preprocessor
  const entries = preprocessor ? preprocessor(rawEntries) : rawEntries

  fillMasterDataEntity(entity, entries, rawEntries)
}

async function updateMasterDataEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>
) {
  logInfo(`Updating "${entity}"`)
  const definition = getMasterDataEntityDefinition(entity)
  const global = !!definition?.global
  await writeDatabaseEntity(entity, entries, { global })
  for (const entityToReload of getAffectedEntities(entity)) {
    await loadMasterDataEntity(entityToReload)
  }
  reloadControls()
  broadcastApplicationStateToApiClients()
}

function handleApiMessage(message: ApiEntityMessage<any>) {
  updateMasterDataEntity(message.entity, message.entries)
  return false
}

export function fillMasterDataEntity<T extends EntityName>(
  type: T,
  entries: MasterData[T],
  rawEntries?: MasterData[T]
): void {
  masterData[type] = entries
  rawMasterData[type] = rawEntries ?? entries

  const map = masterDataMaps[type]
  map.clear()

  for (const entry of entries) {
    map.set(entry.id, entry as any)
  }
}

export async function initMasterData(): Promise<void> {
  const start = Date.now()
  await initMasterDataEntities()
  for (const entity of getEntitiesInDependencyOrder()) {
    await loadMasterDataEntity(entity)
  }

  registerApiMessageHandler('entity', handleApiMessage)

  howLong(start, 'initMasterData')
}

export * from './data'
