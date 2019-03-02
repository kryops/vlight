import { MasterData } from './entities'

// Both ingoing + outgoing

/**
 * Set one or multiple channels
 */
export interface ApiChannelMessage {
  type: 'channels'
  channels: {
    // starting at 1
    [channel: string]: number
  }
}

// Incoming messages

export type ApiInMessage = ApiChannelMessage

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
}

export interface ApiMasterDataMessage {
  type: 'masterdata'
  masterData: MasterData
}

/**
 * Contains the whole DMX universe
 */
export interface ApiUniverseMessage {
  type: 'universe'
  universe: number[]
}

/**
 * Contains an object with changed DMX channels
 */
export interface ApiUniverseDeltaMessage {
  type: 'universe-delta'
  channels: {
    // starting at 1
    [channel: string]: number
  }
}

export type ApiOutMessage =
  | ApiStateMessage
  | ApiMasterDataMessage
  | ApiUniverseMessage
  | ApiUniverseDeltaMessage
  | ApiChannelMessage
