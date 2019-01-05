import {
  ApiStateMessage,
  ApiUniverseDeltaMessage,
  ApiUniverseMessage,
} from '@vlight/api'

export function getApiStateMessage(
  universe: Buffer,
  channels: Buffer
): ApiStateMessage {
  return {
    type: 'state',
    universe: Array.from(universe),
    channels: Array.from(channels),
  }
}

export function getApiUniverseMessage(universe: Buffer): ApiUniverseMessage {
  return {
    type: 'universe',
    universe: Array.from(universe),
  }
}

export function getApiUniverseDeltaMessage(
  universe: Buffer,
  channels: number[]
): ApiUniverseDeltaMessage {
  return {
    type: 'universe-delta',
    channels: channels.reduce(
      (obj, channel) => {
        obj[channel] = universe[channel - 1]
        return obj
      },
      {} as ApiUniverseDeltaMessage['channels']
    ),
  }
}
