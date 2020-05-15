import { EntityName, MasterData } from '@vlight/entities'

import { MapRegistry } from '../../util/registry'

import { masterData, rawMasterData, masterDataMaps } from './data'

export interface MasterDataEntityDefinition<T extends EntityName = EntityName> {
  dependencies?: EntityName[]
  preprocessor?: (rawEntries: MasterData[T]) => MasterData[T]
  global?: boolean
}

const masterDataEntityRegistry = new MapRegistry<
  EntityName,
  MasterDataEntityDefinition<any>
>()

export function registerMasterDataEntity<T extends EntityName>(
  name: T,
  definition: MasterDataEntityDefinition<T>
) {
  masterDataEntityRegistry.register(name, definition)
  masterData[name] = []
  rawMasterData[name] = []
  masterDataMaps[name] = new Map()
}

export function getMasterDataEntityNames() {
  return Array.from(masterDataEntityRegistry.entries.keys())
}

export function getMasterDataEntityDefinition<T extends EntityName>(
  name: T
): MasterDataEntityDefinition<T> | undefined {
  return masterDataEntityRegistry.get(name)
}
