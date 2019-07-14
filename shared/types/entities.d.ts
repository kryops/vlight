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
  name: string
  /**
   * Also accepts
   * - fixture names containing # -> maps all fixtures with this name originally configured
   * - `type:foobar` -> maps all fixtures of type `foobar`
   */
  fixtures: string[]
}

export interface MasterData {
  fixtureTypes: FixtureType[]
  fixtures: Fixture[]
  fixtureGroups: FixtureGroup[]
}

// State

export interface FixtureState {
  on: boolean
  channels: Dictionary<number>
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

export type WidgetConfig =
  | UniverseWidgetConfig
  | ChannelsWidgetConfig
  | FixtureWidgetConfig
  | FixtureGroupWidgetConfig
