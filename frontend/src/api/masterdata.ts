import { MasterData, EntityName, MasterDataMaps } from '@vlight/types'

/**
 * Convenience access to the master data as maps.
 * In React components, access through `useMasterDataMaps()`
 */
export const masterDataMaps: MasterDataMaps = {} as MasterDataMaps

/**
 * Updates the master data maps with master data from the backend.
 */
export function updateMasterDataMapsFromBackend(masterData: MasterData): void {
  for (const [key, entries] of Object.entries(masterData)) {
    if (!masterDataMaps[key as EntityName])
      masterDataMaps[key as EntityName] = new Map()

    const map = masterDataMaps[key as EntityName]
    map.clear()
    for (const entry of entries) {
      map.set(entry.id, entry as any)
    }
  }
}
