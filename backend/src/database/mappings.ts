import { MasterData } from '@vlight/entities'

import { processFixtures } from './entities/fixtures'
import { processFixtureGroups } from './entities/fixture-groups'
import { processMemories } from './entities/memories'
import { processDynamicPages } from './entities/dynamic-pages'

export type EntityName = keyof MasterData
export type EntityDictionary<T = string> = { [key in EntityName]: T }
export type EntityArray<T extends EntityName = EntityName> = MasterData[T]
export type EntityType<T extends EntityName = EntityName> = MasterData[T][0]

export type EntityPreprocessor<T> = (entries: T[]) => T[]
export type EntityPreprocessorDictionary = {
  [key in EntityName]: EntityPreprocessor<EntityType<key>>
}

export const globalEntities = new Set<EntityName>(['fixtureTypes'])

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
