import {
  Dictionary,
  FixtureState,
  IdType,
  MasterData,
  MemoryState,
  EntityName,
  EntityArray,
} from './entities'

// Both ingoing + outgoing

/** Set one or multiple channels */
export interface ApiChannelMessage {
  type: 'channels'
  channels: Dictionary<number> // starting at 1
}

/** Change the state of a fixture */
export interface ApiFixtureStateMessage {
  type: 'fixture'
  id: IdType
  state: FixtureState
}

/** Change the state of a fixture group */
export interface ApiFixtureGroupStateMessage {
  type: 'fixture-group'
  id: IdType
  state: FixtureState
}

/** Change the state of a memory */
export interface ApiMemoryStateMessage {
  type: 'memory'
  id: IdType
  state: MemoryState
}

// Incoming messages

export interface ApiEntityMessage<T extends EntityName> {
  type: 'entity'
  entity: T
  entries: EntityArray<T>
}

export type ApiInMessage<T extends EntityName = any> =
  | ApiChannelMessage
  | ApiFixtureStateMessage
  | ApiFixtureGroupStateMessage
  | ApiMemoryStateMessage
  | ApiEntityMessage<T>

// Outgoing messages

/**
 * Backend state.
 * This message is sent automatically after a socket connects
 */
export interface ApiStateMessage {
  type: 'state'
  masterData: MasterData
  rawMasterData: MasterData
  universe: number[]
  channels: number[]
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
  memories: Dictionary<MemoryState>
}

export interface ApiMasterDataMessage {
  type: 'masterdata'
  masterData: MasterData
  rawMasterData: MasterData
}

/** Contains the whole DMX universe */
export interface ApiUniverseMessage {
  type: 'universe'
  universe: number[]
}

/** Contains an object with changed DMX channels */
export interface ApiUniverseDeltaMessage {
  type: 'universe-delta'
  channels: Dictionary<number> // starting at 1
}

export type ApiOutMessage =
  | ApiStateMessage
  | ApiMasterDataMessage
  | ApiUniverseMessage
  | ApiUniverseDeltaMessage
  | ApiChannelMessage
  | ApiFixtureStateMessage
  | ApiFixtureGroupStateMessage
  | ApiMemoryStateMessage
