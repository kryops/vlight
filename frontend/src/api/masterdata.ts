import { MasterData, EntityName, MasterDataMaps } from '@vlight/types'

let masterDataMaps: MasterDataMaps = {} as MasterDataMaps

/**
 * Convenience access to the master data as maps.
 *
 * The maps are replaced (not mutated) on every update.
 * In React components, access through `useMasterDataMaps()`
 */
export function getMasterDataMaps(): MasterDataMaps {
  return masterDataMaps
}

/**
 * Updates the master data maps with master data from the backend.
 */
export function updateMasterDataMapsFromBackend(masterData: MasterData): void {
  const newMaps = {} as MasterDataMaps
  for (const [key, entries] of Object.entries(masterData)) {
    newMaps[key as EntityName] = new Map(
      entries.map((entry: any) => [entry.id, entry])
    )
  }
  masterDataMaps = newMaps
}
