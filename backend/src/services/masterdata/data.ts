import { MasterData, IdType } from '@vlight/entities'

export const masterData: MasterData = {
  fixtureTypes: [],
  fixtures: [],
  fixtureGroups: [],
  memories: [],
  dynamicPages: [],
}

export const rawMasterData: MasterData = {
  fixtureTypes: [],
  fixtures: [],
  fixtureGroups: [],
  memories: [],
  dynamicPages: [],
}

type MasterDataMaps = {
  [key in keyof MasterData]: Map<
    IdType,
    MasterData[key] extends Array<infer U> ? U : never
  >
}

export const masterDataMaps: MasterDataMaps = {
  fixtureTypes: new Map(),
  fixtures: new Map(),
  fixtureGroups: new Map(),
  memories: new Map(),
  dynamicPages: new Map(),
}
