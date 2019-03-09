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
 * In React components, access through `userMasterDataMaps()`
 */

export interface MasterDataMaps {
  fixtureTypes: Map<IdType, FixtureType>
  fixtures: Map<IdType, Fixture>
}

export const fixtureTypes: Map<IdType, FixtureType> = new Map()
export const fixtures: Map<IdType, Fixture> = new Map()

export const masterDataMaps: MasterDataMaps = {
  fixtureTypes,
  fixtures,
}

function updateMapWithArray<T extends DbEntity>(map: Map<IdType, T>, arr: T[]) {
  map.clear()
  for (const entry of arr) {
    map.set(entry.id, entry)
  }
}

export function updateMasterData(masterData: MasterData) {
  updateMapWithArray(fixtureTypes, masterData.fixtureTypes)
  updateMapWithArray(fixtures, masterData.fixtures)
}
