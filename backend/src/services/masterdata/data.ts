import { MasterData, EntityName, MasterDataMaps } from '@vlight/entities'

// This is a dictionary to ensure that TypeScript throws an error if we forget to register a new entity here
const allEntities: { [key in EntityName]: true } = {
  dynamicPages: true,
  fixtureGroups: true,
  fixtureTypes: true,
  fixtures: true,
  memories: true,
}

export const allEntityNames = Object.keys(allEntities) as EntityName[]

export const masterData: MasterData = {} as MasterData

export const rawMasterData: MasterData = {} as MasterData

export const masterDataMaps: MasterDataMaps = {} as MasterDataMaps

allEntityNames.forEach(name => {
  masterData[name] = []
  rawMasterData[name] = []
  masterDataMaps[name] = new Map()
})
