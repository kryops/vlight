import { EntityName, EntityType } from '@vlight/entities'

import { processFixtures } from './fixtures'
import { processFixtureGroups } from './fixture-groups'
import { processMemories } from './memories'
import { processDynamicPages } from './dynamic-pages'

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
