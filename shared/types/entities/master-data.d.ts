import { ChaseColorPreset } from './chase'
import { DynamicPage } from './dynamic-page'
import { Fixture } from './fixture'
import { FixtureGroup } from './fixture-group'
import { FixtureType } from './fixture-type'
import { Memory, MemorySceneStatePreset } from './memory'
import { IdType } from './util'

/** Mapping of entity keys to their type. */
interface MasterDataMapping {
  fixtureTypes: FixtureType
  fixtures: Fixture
  fixtureGroups: FixtureGroup
  memories: Memory
  dynamicPages: DynamicPage
  chaseColorPresets: ChaseColorPreset
  memorySceneStatePresets: MemorySceneStatePreset
}

/**
 * Dictionary of all master data entities as arrays.
 */
export type MasterData = {
  [key in keyof MasterDataMapping]: Array<MasterDataMapping[key]>
}

/**
 * Dictionary of all master data entities as maps.
 */
export type MasterDataMaps = {
  [key in keyof MasterData]: Map<
    IdType,
    MasterData[key] extends Array<infer U> ? U : never
  >
}

/**
 * Object that contains the master data both as arrays and as maps
 * in order to optimize the type of access that fits best.
 */
export interface MasterDataWithMaps {
  masterData: MasterData
  masterDataMaps: MasterDataMaps
}

/** The name of a master data entity type. */
export type EntityName = keyof MasterDataMapping

/** An array of a certain master data entity type. */
export type EntityArray<T extends EntityName = EntityName> = Array<
  MasterDataMapping[T]
>

/** The type definition of a certain master data entity type. */
export type EntityType<T extends EntityName = EntityName> = MasterDataMapping[T]
