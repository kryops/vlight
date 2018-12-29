import { ApiChannelMessage, ApiUniverseMessage } from './types'

export function getApiChannelMessage(
  channel: number,
  value: number
): ApiChannelMessage {
  return {
    type: 'channel',
    channel,
    value,
  }
}

export function getApiUniverseMessage(universe: Buffer): ApiUniverseMessage {
  return {
    type: 'universe',
    universe: Array.from(universe),
  }
}
