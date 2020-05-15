import { MasterData, IdType } from '@vlight/entities'

export const masterData: MasterData = {} as MasterData

export const rawMasterData: MasterData = {} as MasterData

type MasterDataMaps = {
  [key in keyof MasterData]: Map<
    IdType,
    MasterData[key] extends Array<infer U> ? U : never
  >
}

export const masterDataMaps: MasterDataMaps = {} as MasterDataMaps
