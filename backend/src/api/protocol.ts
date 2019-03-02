import {
  ApiMasterDataMessage,
  ApiStateMessage,
  ApiUniverseDeltaMessage,
  ApiUniverseMessage,
} from '@vlight/api'

import { masterData } from '../database'

export function getApiStateMessage(
  universe: Buffer,
  channels: Buffer
): ApiStateMessage {
  return {
    type: 'state',
    masterData,
    universe: Array.from(universe),
    channels: Array.from(channels),
  }
}

export function getApiMasterDataMessage(): ApiMasterDataMessage {
  return {
    type: 'masterdata',
    masterData,
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
