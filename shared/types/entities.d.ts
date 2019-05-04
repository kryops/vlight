export type IdType = string

export interface DbEntity {
  id: IdType
}

export interface Dictionary<T> {
  [key: string]: T
}

export interface FixtureType extends DbEntity {
  name: string
  mapping: string[]
}

export interface Fixture extends DbEntity {
  type: IdType
  channel: number
  name?: string
  count?: number
}

export interface FixtureGroup extends DbEntity {
  name: string
  fixtures: string[]
}

export interface MasterData {
  fixtureTypes: FixtureType[]
  fixtures: Fixture[]
  fixtureGroups: FixtureGroup[]
}

export interface FixtureState {
  on: boolean
  channels: Dictionary<number>
}
