import { ValueOrRandom } from './util'

export type IdType = string

export interface DbEntity {
  id: IdType
}

export interface Dictionary<T> {
  [key: string]: T
}

// MasterData

export type FixtureShape = 'square' | 'circle'

export type FixtureBorderStyle = 'solid' | 'dotted' | 'dashed'

export interface FixtureType extends DbEntity {
  name: string
  mapping: string[]
  shape?: FixtureShape
  border?: FixtureBorderStyle
  xSize?: number
  ySize?: number
}

export interface Fixture extends DbEntity {
  type: IdType
  channel: number
  name?: string
  count?: number
  fixturesSharingChannel?: number
  x?: number
  y?: number
  xOffset?: number
  yOffset?: number
  originalId?: IdType
}

export interface FixtureGroup extends DbEntity {
  name?: string
  /**
   * Also accepts
   * - `all:foobar` -> maps all fixtures with this ID originally configured
   * - `type:foobar` -> maps all fixtures of type `foobar`
   */
  fixtures: string[]
}

export type MemorySceneState = FixtureState | FixtureStateGradient[]

export interface MemoryScene {
  /**
   * Accepts
   * - fixture IDs
   * - `all:foobar` -> maps all fixtures with this ID originally configured
   * - `type:foobar` -> maps all fixtures of type `foobar`
   * - `group:foobar` -> maps all fixtures of group `foobar`
   */
  members: string[]
  pattern?: 'row' | 'alternate'
  states: Array<MemorySceneState>
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

export interface MasterDataWithMaps {
  masterData: MasterData
  masterDataMaps: MasterDataMaps
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
  forceMaster?: boolean
}

export interface LiveMemory extends MemoryScene {
  on: boolean
  value: number
}

export type RandomChannels = Dictionary<ValueOrRandom<number>>

export interface ChaseColor {
  channels: RandomChannels
  /** default: 1 */
  // distribution?: number
}

export interface LiveChase {
  on: boolean
  members: string[]
  value: number
  /** in seconds */
  speed: number
  /** in seconds */
  fade?: number
  fadeLockedToSpeed?: boolean
  stopped?: boolean
  /** between 0 and 1 */
  light: ValueOrRandom<number>
  colors: ChaseColor[]
  /** When turned on/started, stops and turns off all other live chases */
  single?: boolean
  /** Currently in burst mode. Will ignore single mode when set */
  burst?: boolean
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

export interface LiveMemoryWidgetConfig {
  type: 'live-memory'
  id: string
}

export interface LiveChaseWidgetConfig {
  type: 'live-chase'
  id: string
}

export interface MapWidgetConfig {
  type: 'map'
}

export type WidgetConfig =
  | UniverseWidgetConfig
  | ChannelsWidgetConfig
  | FixtureWidgetConfig
  | FixtureGroupWidgetConfig
  | MemoryWidgetConfig
  | LiveMemoryWidgetConfig
  | MapWidgetConfig
  | LiveChaseWidgetConfig

export interface DynamicPageCell {
  factor?: number
  widgets: WidgetConfig[]
}

export interface DynamicPageRow {
  headline?: string
  cells: DynamicPageCell[]
}

export interface DynamicPage extends DbEntity {
  name?: string
  icon?: string
  headline?: string
  rows: DynamicPageRow[]
}
