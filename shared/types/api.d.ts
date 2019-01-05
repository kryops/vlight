// Both ingoing + outgoing

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

export interface ApiUniverseMessage {
  type: 'universe'
  universe: number[]
}

export type ApiOutMessage = ApiChannelMessage | ApiUniverseMessage
