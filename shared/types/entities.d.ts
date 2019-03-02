export interface DbEntity {
  id: number
}

export interface FixtureType extends DbEntity {
  name: string
  mapping: string[]
}

export interface Fixture extends DbEntity {
  type: number
  channel: number
  name?: string
}

export interface MasterData {
  fixtureTypes: FixtureType[]
  fixtures: Fixture[]
}
