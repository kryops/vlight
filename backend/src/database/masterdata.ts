import {
  Fixture,
  FixtureType,
  IdType,
  MasterData,
  FixtureGroup,
  DynamicPage,
  Memory,
} from '@vlight/entities'

export const masterData: MasterData = {
  fixtureTypes: [],
  fixtures: [],
  fixtureGroups: [],
  memories: [],
  dynamicPages: [],
}

export const fixtureTypes: Map<IdType, FixtureType> = new Map()
export const fixtures: Map<IdType, Fixture> = new Map()
export const fixtureGroups: Map<IdType, FixtureGroup> = new Map()
export const memories: Map<IdType, Memory> = new Map()
export const dynamicPages: Map<IdType, DynamicPage> = new Map()
