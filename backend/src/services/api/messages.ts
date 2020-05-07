import { ApiStateMessage } from '@vlight/api'

import { getDmxUniverse } from '../universe'
import { channelUniverse } from '../../controls/channels'
import { fixtureStates } from '../../controls/fixtures'
import { fixtureGroupStates } from '../../controls/fixture-groups'
import { memoryStates } from '../../controls/memories'
import { mapToDictionary } from '../../util/shared'
import { masterData, rawMasterData } from '../database'

import { getApiStateMessage } from './protocol'

export function getFullState(): ApiStateMessage {
  return getApiStateMessage({
    masterData,
    rawMasterData,
    universe: getDmxUniverse(),
    channels: channelUniverse,
    fixtures: mapToDictionary(fixtureStates),
    fixtureGroups: mapToDictionary(fixtureGroupStates),
    memories: mapToDictionary(memoryStates),
  })
}
