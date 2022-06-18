import { ApiChannelMessage } from '@vlight/types'

import { getPersistedState } from '../../services/state'
import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
  removeUniverse,
} from '../../services/universe'
import { howLong } from '../../util/time'
import { controlRegistry } from '../registry'
import { registerApiMessageHandler } from '../../services/api/registry'

/** The universe for the channel controls. */
export let channelUniverse: Universe

function loadChannelsFromState() {
  for (const [index, value] of Object.entries(getPersistedState().channels)) {
    channelUniverse[+index] = value
  }
}

function handleApiMessage(message: ApiChannelMessage): boolean {
  let changed = false
  for (const [channel, value] of Object.entries(message.channels)) {
    if (setUniverseChannel(channelUniverse, +channel, value)) {
      changed = true
    }
  }
  return changed
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  removeUniverse(channelUniverse)
  channelUniverse.fill(0)
  loadChannelsFromState()
  addUniverse(channelUniverse)
}

export function init(): void {
  const start = Date.now()
  channelUniverse = createUniverse()
  loadChannelsFromState()
  addUniverse(channelUniverse)

  controlRegistry.register({ reload })
  registerApiMessageHandler('channels', handleApiMessage)

  howLong(start, 'initChannels')
}
