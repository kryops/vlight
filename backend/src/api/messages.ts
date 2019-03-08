import { ApiStateMessage } from '@vlight/api'

import { getDmxUniverse } from '../universe'
import { channelUniverse } from '../universe/channels'
import { fixtureStates } from '../universe/fixtures'
import { mapToDictionary } from '../util/map'

import { getApiStateMessage } from './protocol'

export function getFullState(): ApiStateMessage {
  return getApiStateMessage(
    getDmxUniverse(),
    channelUniverse,
    mapToDictionary(fixtureStates)
  )
}
