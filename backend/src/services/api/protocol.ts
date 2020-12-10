import {
  ApiFixtureStateMessage,
  ApiMasterDataMessage,
  ApiStateMessage,
  ApiUniverseDeltaMessage,
  ApiUniverseMessage,
  Dictionary,
  FixtureState,
  IdType,
  MemoryState,
  MasterData,
  LiveMemory,
  LiveChase,
} from '@vlight/types'

import { getUniverseIndex } from '../universe/utils'

export function getApiStateMessage({
  masterData,
  rawMasterData,
  universe,
  channels,
  fixtures,
  fixtureGroups,
  memories,
  liveMemories,
  liveChases,
}: {
  masterData: MasterData
  rawMasterData: MasterData
  universe: Buffer
  channels: Buffer
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
  memories: Dictionary<MemoryState>
  liveMemories: Dictionary<LiveMemory>
  liveChases: Dictionary<LiveChase>
}): ApiStateMessage {
  return {
    type: 'state',
    masterData,
    rawMasterData,
    universe: Array.from(universe),
    channels: Array.from(channels),
    fixtures,
    fixtureGroups,
    memories,
    liveMemories,
    liveChases,
  }
}

export function getApiMasterDataMessage({
  masterData,
  rawMasterData,
}: {
  masterData: MasterData
  rawMasterData: MasterData
}): ApiMasterDataMessage {
  return {
    type: 'masterdata',
    masterData,
    rawMasterData,
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
    channels: channels.reduce((obj, channel) => {
      obj[channel] = universe[getUniverseIndex(channel)]
      return obj
    }, {} as ApiUniverseDeltaMessage['channels']),
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
