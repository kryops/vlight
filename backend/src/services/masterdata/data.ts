import { MasterData, EntityName, MasterDataMaps } from '@vlight/types'

// This is a dictionary to ensure that TypeScript throws an error if we forget to register a new entity here
const allEntities: { [key in EntityName]: true } = {
  dynamicPages: true,
  fixtureGroups: true,
  fixtureTypes: true,
  fixtures: true,
  memories: true,
  chaseColorPresets: true,
}

/**
 * Array containing the names of all master data entity types.
 */
export const allEntityNames = Object.keys(allEntities) as EntityName[]

/**
 * Dictionary of all (pre-processed) master data entities as arrays.
 */
export const masterData: MasterData = {} as MasterData

/**
 * Dictionary of all raw (non pre-processed) master data entities as arrays.
 */
export const rawMasterData: MasterData = {} as MasterData

/**
 * Dictionary containing the (pre-processed) master data entities as maps.
 */
export const masterDataMaps: MasterDataMaps = {} as MasterDataMaps

allEntityNames.forEach(name => {
  masterData[name] = []
  rawMasterData[name] = []
  masterDataMaps[name] = new Map()
})
