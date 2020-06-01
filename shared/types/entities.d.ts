export type IdType = string

export interface DbEntity {
  id: IdType
}

export interface Dictionary<T> {
  [key: string]: T
}

// MasterData

export interface FixtureType extends DbEntity {
  name: string
  mapping: string[]
}

export interface Fixture extends DbEntity {
  type: IdType
  channel: number
  name?: string
  count?: number
  originalId?: IdType
}

export interface FixtureGroup extends DbEntity {
  name?: string
  /**
   * Also accepts
   * - fixture IDs containing # -> maps all fixtures with this ID originally configured
   * - `type:foobar` -> maps all fixtures of type `foobar`
   */
  fixtures: string[]
}

export interface MemoryScene {
  /**
   * Accepts
   * - fixture IDs
   * - fixture IDs containing # -> maps all fixtures with this ID originally configured
   * - `type:foobar` -> maps all fixtures of type `foobar`
   * - `group:foobar` -> maps all fixtures of group `foobar`
   */
  members: string[]
  pattern?: 'row' | 'alternate'
  states: Array<FixtureState | FixtureStateGradient[]>
}

export interface Memory extends DbEntity {
  name?: string
  scenes: MemoryScene[]
}

export interface FixtureStateGradient {
  /** 0 - 100 */
  position?: number
  channels: Dictionary<number>
}

export interface MasterDataMapping {
  fixtureTypes: FixtureType
  fixtures: Fixture
  fixtureGroups: FixtureGroup
  memories: Memory
  dynamicPages: DynamicPage
}

export type MasterData = {
  [key in keyof MasterDataMapping]: Array<MasterDataMapping[key]>
}

export type MasterDataMaps = {
  [key in keyof MasterData]: Map<
    IdType,
    MasterData[key] extends Array<infer U> ? U : never
  >
}

export type EntityName = keyof MasterDataMapping
export type EntityDictionary<T = string> = { [key in EntityName]: T }
export type EntityArray<T extends EntityName = EntityName> = Array<
  MasterDataMapping[T]
>
export type EntityType<T extends EntityName = EntityName> = MasterDataMapping[T]

// State

export interface FixtureState {
  on: boolean
  channels: Dictionary<number>
  initial?: boolean
}

export interface MemoryState {
  on: boolean
  value: number
  initial?: boolean
}

// Widgets

export interface UniverseWidgetConfig {
  type: 'universe'
  from: number
  to: number
  title?: string
}

export interface ChannelsWidgetConfig {
  type: 'channels'
  from: number
  to: number
  title?: string
}

export interface FixtureWidgetConfig {
  type: 'fixture'
  id: string
}

export interface FixtureGroupWidgetConfig {
  type: 'fixture-group'
  id: string
}

export interface MemoryWidgetConfig {
  type: 'memory'
  id: string
}

export type WidgetConfig =
  | UniverseWidgetConfig
  | ChannelsWidgetConfig
  | FixtureWidgetConfig
  | FixtureGroupWidgetConfig
  | MemoryWidgetConfig

export interface GridCellConfig {
  factor?: number
  widgets: WidgetConfig[]
}

export interface GridRowConfig {
  headline?: string
  cells: GridCellConfig[]
}

export interface DynamicPage extends DbEntity {
  icon?: string
  headline?: string
  rows: GridRowConfig[]
}
