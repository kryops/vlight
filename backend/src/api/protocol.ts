import {
  ApiFixtureStateMessage,
  ApiMasterDataMessage,
  ApiStateMessage,
  ApiUniverseDeltaMessage,
  ApiUniverseMessage,
} from '@vlight/api'
import { Dictionary, FixtureState, IdType, MemoryState } from '@vlight/entities'

import { masterData } from '../database'
import { getUniverseIndex } from '../services/universe'

export function getApiStateMessage(
  universe: Buffer,
  channels: Buffer,
  fixtures: Dictionary<FixtureState>,
  fixtureGroups: Dictionary<FixtureState>,
  memories: Dictionary<MemoryState>
): ApiStateMessage {
  return {
    type: 'state',
    masterData,
    universe: Array.from(universe),
    channels: Array.from(channels),
    fixtures,
    fixtureGroups,
    memories,
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
        obj[channel] = universe[getUniverseIndex(channel)]
        return obj
      },
      {} as ApiUniverseDeltaMessage['channels']
    ),
  }
}

export function getApiFixtureStateMessage(
  id: IdType,
  state: FixtureState
): ApiFixtureStateMessage {
  return {
    type: 'fixture',
    id,
    state,
  }
}
