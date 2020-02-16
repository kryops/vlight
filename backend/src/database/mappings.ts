import { MasterData } from '@vlight/entities'

import { processFixtures } from './entities/fixtures'
import { processFixtureGroups } from './entities/fixture-groups'
import { processMemories } from './entities/memories'

export type EntityName = keyof MasterData
export type EntityDictionary<T = string> = { [key in EntityName]: T }
export type EntityType = MasterData[EntityName][0]

export type EntityPreprocessor<T> = (entries: T[]) => T[]
export type EntityPreprocessorDictionary = {
  [key in EntityName]: EntityPreprocessor<MasterData[key][0]>
}

export const globalEntities = new Set<EntityName>(['fixtureTypes'])

export const entityToTypeName: EntityDictionary = {
  fixtureTypes: 'FixtureType[]',
  fixtures: 'Fixture[]',
  fixtureGroups: 'FixtureGroup[]',
  memories: 'Memory[]',
  dynamicPages: 'DynamicPage[]',
}

export const entityToFileName: EntityDictionary = {
  fixtureTypes: 'fixture-types',
  fixtures: 'fixtures',
  fixtureGroups: 'fixture-groups',
  memories: 'memories',
  dynamicPages: 'dynamic-pages',
}

export const entityPreprocessors: Partial<EntityPreprocessorDictionary> = {
  fixtures: processFixtures,
  fixtureGroups: processFixtureGroups,
  memories: processMemories,
}

export const entityOrder: EntityName[] = [
  'fixtureTypes',
  // depends on fixtureTypes
  'fixtures',
  // depends on fixtures
  'fixtureGroups',
  // depends on fixtureGroups
]
