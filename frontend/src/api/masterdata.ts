import {
  DbEntity,
  Fixture,
  FixtureType,
  IdType,
  MasterData,
  FixtureGroup,
  Memory,
} from '@vlight/entities'

/*
 * Convenience access to the master data.
 * Always combine with `useMasterData()` to get correct re-renders!
 * In React components, access through `userMasterDataMaps()`
 */

export const fixtureTypes: Map<IdType, FixtureType> = new Map()
export const fixtures: Map<IdType, Fixture> = new Map()
export const fixtureGroups: Map<IdType, FixtureGroup> = new Map()
export const memories: Map<IdType, Memory> = new Map()

export const masterDataMaps = {
  fixtureTypes,
  fixtures,
  fixtureGroups,
  memories,
}

function updateMapWithArray<T extends DbEntity>(map: Map<IdType, T>, arr: T[]) {
  map.clear()
  for (const entry of arr) {
    map.set(entry.id, entry)
  }
}

export function updateMasterData(masterData: MasterData) {
  const keys = Object.keys(masterDataMaps) as Array<keyof typeof masterDataMaps>
  for (const key of keys) {
    updateMapWithArray<Unpacked<MasterData[typeof key]>>(
      masterDataMaps[key],
      masterData[key]
    )
  }
}
