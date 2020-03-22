import {
  MasterData,
  EntityName,
  EntityType,
  EntityArray,
} from '@vlight/entities'

import {
  entityPreprocessors,
  EntityPreprocessor,
  entityOrder,
} from './mappings'
import * as masterDataModule from './masterdata'
import { JsDatabaseBackend } from './backends/js-backend'

const masterData = masterDataModule.masterData
const rawMasterData = masterDataModule.rawMasterData
const allEntityNames = Object.keys(masterData) as EntityName[]

const backend = new JsDatabaseBackend()

async function initEntity<T extends EntityName>(entity: T) {
  const rawEntries = await backend.loadEntities(entity)

  const preprocessor = entityPreprocessors[entity] as
    | EntityPreprocessor<EntityType<T>>
    | undefined
  const entries = preprocessor ? preprocessor(rawEntries) : rawEntries

  fillEntity(entity, entries as any, rawEntries as any)
}

export function fillEntity<T extends EntityName>(
  type: T,
  entries: MasterData[T],
  rawEntries?: MasterData[T]
) {
  masterData[type] = entries
  rawMasterData[type] = rawEntries ?? entries
  const map = masterDataModule[type]
  map.clear()

  for (const entry of entries) {
    map.set(entry.id, entry as any)
  }
}

function getAffectedEntities(changedEntity: EntityName): EntityName[] {
  if (!entityOrder.includes(changedEntity)) {
    return [changedEntity]
  }

  return [
    ...entityOrder.slice(entityOrder.indexOf(changedEntity)),
    ...allEntityNames.filter(entity => !entityOrder.includes(entity)),
  ]
}

export async function initEntities() {
  const entitiesToLoad: EntityName[] = [
    ...entityOrder,
    ...allEntityNames.filter(entity => !entityOrder.includes(entity)),
  ]

  for (const entity of entitiesToLoad) await initEntity(entity)
}

export async function writeEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>
) {
  await backend.writeEntities(entity, entries)
  for (const entityToReload of getAffectedEntities(entity)) {
    await initEntity(entityToReload)
  }
}
