import { ApiChannelMessage, ApiUniverseMessage } from '@vlight/api'

export function getApiChannelsMessage(
  universe: Buffer,
  channels: number[]
): ApiChannelMessage {
  return {
    type: 'channels',
    channels: channels.reduce(
      (obj, channel) => {
        obj[channel] = universe[channel - 1]
        return obj
      },
      {} as ApiChannelMessage['channels']
    ),
  }
}

export function getApiUniverseMessage(universe: Buffer): ApiUniverseMessage {
  return {
    type: 'universe',
    universe: Array.from(universe),
  }
}
