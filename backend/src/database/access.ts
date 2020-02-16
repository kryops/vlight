import { join } from 'path'

import { MasterData } from '@vlight/entities'

import { project, configDirectoryPath } from '../config'

import {
  EntityType,
  EntityName,
  entityToFileName,
  globalEntities,
  entityPreprocessors,
  EntityPreprocessor,
  entityOrder,
} from './mappings'
import * as masterDataModule from './masterdata'

const masterData = masterDataModule.masterData

function initEntity<T extends EntityType>(entity: EntityName) {
  const fileName = entityToFileName[entity]

  const configPath = globalEntities.has(entity)
    ? join(configDirectoryPath, fileName)
    : join(configDirectoryPath, project, fileName)
  // enable reloading
  delete require.cache[require.resolve(configPath)]
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rawEntries: T[] = require(configPath)

  const preprocessor = entityPreprocessors[entity] as
    | EntityPreprocessor<T>
    | undefined
  const entries = preprocessor ? preprocessor(rawEntries) : rawEntries

  fillEntity(entity, entries as any)
}

export function fillEntity<T extends EntityName>(
  type: T,
  entries: MasterData[T]
) {
  masterData[type] = entries
  const map = masterDataModule[type]
  map.clear()

  for (const entry of entries) {
    map.set(entry.id, entry as any)
  }
}

export function initEntities() {
  const allEntityNames = Object.keys(masterData) as EntityName[]

  const entitiesToLoad: EntityName[] = [
    ...entityOrder,
    ...allEntityNames.filter(entity => !entityOrder.includes(entity)),
  ]

  for (const entity of entitiesToLoad) initEntity(entity)
}
