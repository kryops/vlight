// Both ingoing + outgoing

/**
 * Set one or multiple channels
 */
export interface ApiChannelMessage {
  type: 'channels'
  channels: {
    // starting at 1
    [channel: number]: number
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
  universe: number[]
  channels: number[]
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
    [channel: number]: number
  }
}

export type ApiOutMessage =
  | ApiStateMessage
  | ApiUniverseMessage
  | ApiUniverseDeltaMessage
  | ApiChannelMessage
