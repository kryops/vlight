import { MasterData } from '@vlight/entities'

import {
  EntityType,
  EntityName,
  entityPreprocessors,
  EntityPreprocessor,
  entityOrder,
  EntityArray,
} from './mappings'
import * as masterDataModule from './masterdata'
import { JsDatabaseBackend } from './backends/js-backend'

const masterData = masterDataModule.masterData
const rawMasterData = masterDataModule.rawMasterData

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

export async function initEntities() {
  const allEntityNames = Object.keys(masterData) as EntityName[]

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
  // we need to reload all entities in case other preprocessed entities depend
  // on the changed entries
  await initEntities()
}
