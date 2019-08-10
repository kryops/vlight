import {
  DbEntity,
  Fixture,
  FixtureType,
  IdType,
  MasterData,
  FixtureGroup,
  DynamicPage,
} from '@vlight/entities'

import { processFixtures } from './fixtures'
import { processFixtureGroups } from './fixture-groups'
import { initPersistedState } from './state'

export const relativeConfigDirectoryPath = '../../../config/'

export const masterData: MasterData = {
  fixtureTypes: [],
  fixtures: [],
  fixtureGroups: [],
  dynamicPages: [],
}
export const fixtureTypes: Map<IdType, FixtureType> = new Map()
export const fixtures: Map<IdType, Fixture> = new Map()
export const fixtureGroups: Map<IdType, FixtureGroup> = new Map()
export const dynamicPages: Map<IdType, DynamicPage> = new Map()

const masterDataToMaps = {
  fixtureTypes,
  fixtures,
  fixtureGroups,
  dynamicPages,
}

function initEntity<T extends DbEntity>(
  type: keyof MasterData,
  fileName: string,
  preprocessor?: (entries: T[]) => T[]
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rawEntries: T[] = require(relativeConfigDirectoryPath + fileName)

  const entries = preprocessor ? preprocessor(rawEntries) : rawEntries

  fillEntity(type, entries as any)
}

export function fillEntity<T extends keyof MasterData>(
  type: T,
  entries: MasterData[T]
) {
  masterData[type] = entries
  const map = masterDataToMaps[type]
  map.clear()

  for (const entry of entries) {
    map.set(entry.id, entry as any)
  }
}

export async function initDatabase() {
  initEntity('fixtureTypes', 'fixture-types')
  // depends on fixtureTypes
  initEntity('fixtures', 'fixtures', processFixtures)
  initEntity('fixtureGroups', 'fixture-groups', processFixtureGroups)
  initEntity('dynamicPages', 'dynamic-pages')

  initPersistedState()
}
