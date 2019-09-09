import { ApiStateMessage } from '@vlight/api'

import { getDmxUniverse } from '../services/universe'
import { channelUniverse } from '../controls/channels'
import { fixtureStates } from '../controls/fixtures'
import { fixtureGroupStates } from '../controls/fixture-groups'
import { memoryStates } from '../controls/memories'
import { mapToDictionary } from '../util/map'

import { getApiStateMessage } from './protocol'

export function getFullState(): ApiStateMessage {
  return getApiStateMessage(
    getDmxUniverse(),
    channelUniverse,
    mapToDictionary(fixtureStates),
    mapToDictionary(fixtureGroupStates),
    mapToDictionary(memoryStates)
  )
}
