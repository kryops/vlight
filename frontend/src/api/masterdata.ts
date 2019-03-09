import {
  DbEntity,
  Fixture,
  FixtureType,
  IdType,
  MasterData,
} from '@vlight/entities'

/*
 * Convenience access to the master data.
 * Always combine with `useMasterData()` to get correct re-renders!
 */

export const fixtures: Map<IdType, Fixture> = new Map()
export const fixtureTypes: Map<IdType, FixtureType> = new Map()

function updateMapWithArray<T extends DbEntity>(map: Map<IdType, T>, arr: T[]) {
  map.clear()
  for (const entry of arr) {
    map.set(entry.id, entry)
  }
}

export function updateMasterData(masterData: MasterData) {
  updateMapWithArray(fixtures, masterData.fixtures)
  updateMapWithArray(fixtureTypes, masterData.fixtureTypes)
}
