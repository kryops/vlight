import { DbEntity, Fixture, FixtureType, MasterData } from '@vlight/entities'

export const fixtureTypes: Map<number, FixtureType> = new Map()
export const fixtures: Map<number, Fixture> = new Map()
export const masterData: MasterData = {
  fixtureTypes: [],
  fixtures: [],
}

function initEntity<T extends DbEntity>(
  arr: T[],
  map: Map<number, T>,
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
