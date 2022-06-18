import { ApiStateMessage } from '@vlight/types'
import { mapToDictionary } from '@vlight/utils'

import { getDmxUniverse } from '../universe'
import { channelUniverse } from '../../controls/channels'
import { fixtureStates } from '../../controls/fixtures'
import { fixtureGroupStates } from '../../controls/fixture-groups'
import { memoryStates, liveMemories } from '../../controls/memories'
import { liveChases } from '../../controls/chases/live-chases'
import { masterData, rawMasterData } from '../masterdata'

import { getApiStateMessage } from './protocol'

/**
 * Returns an API message containing the complete application state including the master data.
 */
export function getFullState(): ApiStateMessage {
  return getApiStateMessage({
    masterData,
    rawMasterData,
    universe: getDmxUniverse(),
    channels: channelUniverse,
    fixtures: mapToDictionary(fixtureStates),
    fixtureGroups: mapToDictionary(fixtureGroupStates),
    memories: mapToDictionary(memoryStates),
    liveMemories: mapToDictionary(liveMemories),
    liveChases: mapToDictionary(liveChases),
  })
}
