import {
  DbEntity,
  Fixture,
  FixtureType,
  IdType,
  MasterData,
} from '@vlight/entities'

export const fixtureTypes: Map<IdType, FixtureType> = new Map()
export const fixtures: Map<IdType, Fixture> = new Map()
export const masterData: MasterData = {
  fixtureTypes: [],
  fixtures: [],
}

function initEntity<T extends DbEntity>(
  arr: T[],
  map: Map<IdType, T>,
  fileName: string
) {
  const entries: T[] = require('../../../config/' + fileName)

  for (const entry of entries) {
    arr.push(entry)
    map.set(entry.id, entry)
  }
}

export async function initDatabase() {
  initEntity(masterData.fixtureTypes, fixtureTypes, 'fixture-types')
  initEntity(masterData.fixtures, fixtures, 'fixtures')
}
