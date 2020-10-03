import { ApiStateMessage } from '@vlight/api'
import { mapToDictionary } from '@vlight/shared'

import { getDmxUniverse } from '../universe'
import { channelUniverse } from '../../controls/channels'
import { fixtureStates } from '../../controls/fixtures'
import { fixtureGroupStates } from '../../controls/fixture-groups'
import { memoryStates } from '../../controls/memories'
import { masterData, rawMasterData } from '../masterdata'

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
