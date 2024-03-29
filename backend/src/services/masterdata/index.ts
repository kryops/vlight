import {
  EntityName,
  EntityArray,
  MasterData,
  ApiEntityMessage,
  ApiAddEntityMessage,
  ApiUpdateEntityMessage,
  ApiRemoveEntityMessage,
} from '@vlight/types'
import { logger } from '@vlight/utils'

import { reloadControls } from '../../controls'
import {
  writeDatabaseEntity,
  loadDatabaseEntity,
  addDatabaseEntry,
  updateDatabaseEntry,
  removeDatabaseEntry,
} from '../database'
import { broadcastApplicationStateToApiClients } from '../api'
import { registerApiMessageHandler } from '../api/registry'
import { howLong } from '../../util/time'
import { DatabaseEntityOptions } from '../database/backends/database-backend'
import { reloadUniverseService } from '../universe'

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

async function reloadAfterUpdate(changedEntities: EntityName[]) {
  for (const entityToReload of getAffectedEntities(changedEntities)) {
    await loadMasterDataEntity(entityToReload)
  }
  reloadUniverseService()
  await reloadControls()
  broadcastApplicationStateToApiClients()
}

async function updateMasterDataEntity<T extends EntityName>(
  entity: T,
  operation: (options: DatabaseEntityOptions) => Promise<void>
) {
  logger.info(`Updating "${entity}"`)
  const definition = getMasterDataEntityDefinition(entity)
  const global = !!definition?.global

  await operation({ global })
}

const pendingOperations: Array<
  [EntityName, (options: DatabaseEntityOptions) => Promise<void>]
> = []
let running = false

async function updateMasterDataEntityWithLocking<T extends EntityName>(
  entity: T,
  operation: (options: DatabaseEntityOptions) => Promise<void>
) {
  pendingOperations.push([entity, operation])
  if (running) {
    return
  }

  const changedEntities = new Set<EntityName>()

  try {
    running = true

    while (pendingOperations.length) {
      const entry = pendingOperations.shift()
      if (entry) {
        const [entity, operation] = entry
        changedEntities.add(entity)
        await updateMasterDataEntity(entity, operation)
      }

      if (!pendingOperations.length) {
        const entitiesToReload = [...changedEntities]
        changedEntities.clear()
        await reloadAfterUpdate(entitiesToReload)
      }
    }
  } finally {
    running = false
  }
}

/**
 * Fills the given master data entries into the corresponding array and map
 * for the given entity type.
 */
export function fillMasterDataEntity<T extends EntityName>(
  type: T,
  entries: EntityArray<T>,
  rawEntries?: EntityArray<T>
): void {
  masterData[type] = entries as MasterData[T]
  rawMasterData[type] = (rawEntries ?? entries) as MasterData[T]

  const map = masterDataMaps[type]
  map.clear()

  for (const entry of entries) {
    map.set(entry.id, entry as any)
  }
}

function registerApiMessageHandlers() {
  // The master data message handlers all return false as the updateMasterDataEntity function
  // will flush the complete application state including the master data to all connected clients

  registerApiMessageHandler('entity', (message: ApiEntityMessage<any>) => {
    updateMasterDataEntityWithLocking(message.entity, options =>
      writeDatabaseEntity(message.entity, message.entries, options)
    )
    return false
  })

  registerApiMessageHandler(
    'add-entity',
    (message: ApiAddEntityMessage<any>) => {
      updateMasterDataEntityWithLocking(message.entity, options =>
        addDatabaseEntry(message.entity, message.entry, options)
      )
      return false
    }
  )

  registerApiMessageHandler(
    'update-entity',
    (message: ApiUpdateEntityMessage<any>) => {
      updateMasterDataEntityWithLocking(message.entity, options =>
        updateDatabaseEntry(message.entity, message.entry, options)
      )
      return false
    }
  )

  registerApiMessageHandler(
    'remove-entity',
    (message: ApiRemoveEntityMessage<any>) => {
      updateMasterDataEntityWithLocking(message.entity, options =>
        removeDatabaseEntry(message.entity, message.id, options)
      )
      return false
    }
  )
}

export async function initMasterData(): Promise<void> {
  const start = Date.now()
  await initMasterDataEntities()
  for (const entity of getEntitiesInDependencyOrder()) {
    await loadMasterDataEntity(entity)
  }

  registerApiMessageHandlers()

  howLong(start, 'initMasterData')
}

export * from './data'
