import { Dictionary, FixtureState, IdType, MasterData } from './entities'

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

// Incoming messages

export type ApiInMessage =
  | ApiChannelMessage
  | ApiFixtureStateMessage
  | ApiFixtureGroupStateMessage

// Outgoing messages

/**
 * Backend state.
 * This message is sent automatically after a socket connects
 */
export interface ApiStateMessage {
  type: 'state'
  masterData: MasterData
  universe: number[]
  channels: number[]
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
}

export interface ApiMasterDataMessage {
  type: 'masterdata'
  masterData: MasterData
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
