import { EntityName, EntityArray } from '@vlight/types'

import { MapRegistry } from '../../util/registry'

import { masterData, rawMasterData, masterDataMaps } from './data'

/** Definition of a master data entity type. */
export interface MasterDataEntityDefinition<T extends EntityName = EntityName> {
  /**
   * Other entity types this type depends on in its {@link preprocessor}.
   */
  dependencies?: EntityName[]

  /**
   * Transforms the given entries by e.g. resolving groups into their fixtures.
   * All other entity types that are accessed in the process must be listed as {@link dependencies}.
   *
   * The original ("raw") entries are still accessible via {@link rawMasterData}.
   */
  preprocessor?: (rawEntries: EntityArray<T>) => EntityArray<T>

  /**
   * Controls whether the entity type is saved globally independent of the current project.
   *
   * Defaults to `false`.
   */
  global?: boolean
}

const masterDataEntityRegistry = new MapRegistry<
  EntityName,
  MasterDataEntityDefinition<any>
>()

export function registerMasterDataEntity<T extends EntityName>(
  name: T,
  definition: MasterDataEntityDefinition<T>
): void {
  masterDataEntityRegistry.register(name, definition)
  masterData[name] = []
  rawMasterData[name] = []
  masterDataMaps[name] = new Map()
}

export function getMasterDataEntityDefinition<T extends EntityName>(
  name: T
): MasterDataEntityDefinition<T> | undefined {
  return masterDataEntityRegistry.get(name)
}
