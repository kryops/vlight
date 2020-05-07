import {
  Fixture,
  FixtureType,
  IdType,
  MasterData,
  FixtureGroup,
  DynamicPage,
  Memory,
  EntityName,
  EntityArray,
} from '@vlight/entities'

import { reloadControls } from '../controls'
import { logInfo } from '../util/log'

import { reloadDatabase, modifyEntity } from './database'
import { broadcastApplicationStateToApiClients } from './api'

export async function reloadMasterData() {
  logInfo('Reloading master data')
  reloadDatabase()
  reloadControls()
  broadcastApplicationStateToApiClients()
}

export async function updateMasterDataEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>
) {
  logInfo(`Updating "${entity}"`)
  await modifyEntity(entity, entries)
  reloadControls()
  broadcastApplicationStateToApiClients()
}

export const masterData: MasterData = {
  fixtureTypes: [],
  fixtures: [],
  fixtureGroups: [],
  memories: [],
  dynamicPages: [],
}

export const rawMasterData: MasterData = {
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
