// Both ingoing + outgoing

export interface ApiChannelMessage {
  type: 'channel'
  channel: number
  value: number
}

// Incoming messages

export type ApiInMessage = ApiChannelMessage

// Outgoing messages

export interface ApiUniverseMessage {
  type: 'universe'
  universe: number[]
}

export type ApiOutMessage = ApiChannelMessage | ApiUniverseMessage
