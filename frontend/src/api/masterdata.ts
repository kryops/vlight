import { MasterData, EntityName, MasterDataMaps } from '@vlight/types'

/*
 * Convenience access to the master data.
 * In React components, access through `userMasterDataMaps()`
 */

export const masterDataMaps: MasterDataMaps = {} as MasterDataMaps

export function updateMasterData(masterData: MasterData): void {
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
