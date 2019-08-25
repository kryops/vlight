import {
  DbEntity,
  Fixture,
  FixtureType,
  IdType,
  MasterData,
  FixtureGroup,
  DynamicPage,
} from '@vlight/entities'

import { logError } from '../util/log'
import { howLong } from '../util/time'

import { processFixtures } from './entities/fixtures'
import { processFixtureGroups } from './entities/fixture-groups'
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
  const configPath = relativeConfigDirectoryPath + fileName
  // enable reloading
  delete require.cache[require.resolve(configPath)]
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rawEntries: T[] = require(configPath)

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

function loadDatabase() {
  initEntity('fixtureTypes', 'fixture-types')
  // depends on fixtureTypes
  initEntity('fixtures', 'fixtures', processFixtures)
  // depends on fixtures
  initEntity('fixtureGroups', 'fixture-groups', processFixtureGroups)
  initEntity('dynamicPages', 'dynamic-pages')
}

export async function initDatabase() {
  const start = Date.now()
  loadDatabase()
  initPersistedState()
  howLong(start, 'initDatabase')
}

export async function reloadDatabase() {
  try {
    loadDatabase()
  } catch (error) {
    logError(
      'Error reloading database, the update may have only been partial!',
      error
    )
  }
}
