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
import {
  masterData,
  rawMasterData,
  masterDataMaps,
  allEntityNames,
} from './data'

async function loadMasterDataEntity<T extends EntityName>(entity: T) {
  const definition = getMasterDataEntityDefinition(entity)

  const global = !!definition?.global

  const loadedEntries = await loadDatabaseEntity(entity, { global })

  const migration = definition?.migration
  const rawEntries = migration ? migration(loadedEntries) : loadedEntries

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
        try {
          await updateMasterDataEntity(entity, operation)
        } catch (e) {
          // continue with the other operations, and still reload the entity
          // as its database state may have been changed partially
          logger.error(`Updating "${entity}" failed:`, e)
        }
      }

      if (!pendingOperations.length) {
        const entitiesToReload = [...changedEntities]
        changedEntities.clear()
        try {
          await reloadAfterUpdate(entitiesToReload)
        } catch (e) {
          logger.error('Reloading master data failed:', e)
        }
      }
    }
  } finally {
    running = false
  }
}

const validEntityNames = new Set<string>(allEntityNames)

/**
 * Returns whether the given entity name is valid.
 *
 * Entity names are used as file names and in the generated database files,
 * so we must not accept arbitrary input from the API.
 */
function isValidEntityName(entity: unknown): entity is EntityName {
  if (typeof entity === 'string' && validEntityNames.has(entity)) return true
  logger.warn('Ignoring API message for invalid entity', entity)
  return false
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
    if (!isValidEntityName(message.entity)) return false
    void updateMasterDataEntityWithLocking(message.entity, options =>
      writeDatabaseEntity(message.entity, message.entries, options)
    )
    return false
  })

  registerApiMessageHandler(
    'add-entity',
    (message: ApiAddEntityMessage<any>) => {
      if (!isValidEntityName(message.entity)) return false
      void updateMasterDataEntityWithLocking(message.entity, options =>
        addDatabaseEntry(message.entity, message.entry, options)
      )
      return false
    }
  )

  registerApiMessageHandler(
    'update-entity',
    (message: ApiUpdateEntityMessage<any>) => {
      if (!isValidEntityName(message.entity)) return false
      void updateMasterDataEntityWithLocking(message.entity, options =>
        updateDatabaseEntry(message.entity, message.entry, options)
      )
      return false
    }
  )

  registerApiMessageHandler(
    'remove-entity',
    (message: ApiRemoveEntityMessage<any>) => {
      if (!isValidEntityName(message.entity)) return false
      void updateMasterDataEntityWithLocking(message.entity, options =>
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
