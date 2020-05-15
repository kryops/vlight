import { EntityName, EntityType, MasterData } from '@vlight/entities'

import { masterData, rawMasterData, masterDataMaps } from '../data'
import { loadDatabaseEntity } from '../../database'

import { processFixtures } from './fixtures'
import { processFixtureGroups } from './fixture-groups'
import { processMemories } from './memories'
import { processDynamicPages } from './dynamic-pages'

export type EntityPreprocessor<T> = (entries: T[]) => T[]
export type EntityPreprocessorDictionary = {
  [key in EntityName]: EntityPreprocessor<EntityType<key>>
}

export const entityPreprocessors: Partial<EntityPreprocessorDictionary> = {
  fixtures: processFixtures,
  fixtureGroups: processFixtureGroups,
  memories: processMemories,
  dynamicPages: processDynamicPages,
}

export const entityOrder: EntityName[] = [
  'fixtureTypes',
  // depends on fixtureTypes
  'fixtures',
  // depends on fixtures
  'fixtureGroups',
  // depends on fixtureGroups
]

function getAllEntityNames() {
  return Object.keys(masterData) as EntityName[]
}

async function initMasterDataEntity<T extends EntityName>(entity: T) {
  const rawEntries = await loadDatabaseEntity(entity)

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
  const map = masterDataMaps[type]
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
    ...getAllEntityNames().filter(entity => !entityOrder.includes(entity)),
  ]
}

export async function reloadAffectedMasterDataEntities(entity: EntityName) {
  for (const entityToReload of getAffectedEntities(entity)) {
    await initMasterDataEntity(entityToReload)
  }
}

export async function initMasterDataEntities() {
  const entitiesToLoad: EntityName[] = [
    ...entityOrder,
    ...getAllEntityNames().filter(entity => !entityOrder.includes(entity)),
  ]

  for (const entity of entitiesToLoad) await initMasterDataEntity(entity)
}
