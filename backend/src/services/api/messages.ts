import { ApiStateMessage } from '@vlight/types'
import { mapToDictionary } from '@vlight/utils'

import { getDmxMaster, getDmxUniverse, getDmxMasterFade } from '../universe'
import { channelUniverse } from '../../controls/channels'
import { fixtureStates } from '../../controls/fixtures'
import { fixtureGroupStates } from '../../controls/fixture-groups'
import { memoryStates, liveMemories } from '../../controls/memories'
import { liveChases } from '../../controls/chases/live-chases'
import { liveMovements } from '../../controls/movements/live-movements'
import { isPaused } from '../../controls/pause'
import { buttonStates } from '../../controls/buttons'
import { sequenceStates } from '../../controls/sequences/state'
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
    liveMovements: mapToDictionary(liveMovements),
    dmxMaster: getDmxMaster(),
    dmxMasterFade: getDmxMasterFade(),
    paused: isPaused(),
    buttons: mapToDictionary(buttonStates),
    sequences: mapToDictionary(sequenceStates),
  })
}
