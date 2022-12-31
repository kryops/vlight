import { ApiChannelMessage } from '@vlight/types'

import { getPersistedState } from '../../services/state'
import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
  removeUniverse,
  isUniverseEmpty,
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

  if (!isUniverseEmpty(channelUniverse)) {
    addUniverse(channelUniverse)
  }
}

function handleApiMessage(message: ApiChannelMessage): boolean {
  let changed = false

  const setsValues = Object.values(message.channels).some(value => value > 0)

  if (setsValues) {
    addUniverse(channelUniverse)
  }

  for (const [channel, value] of Object.entries(message.channels)) {
    if (setUniverseChannel(channelUniverse, +channel, value)) {
      changed = true
    }
  }

  if (!setsValues && isUniverseEmpty(channelUniverse)) {
    removeUniverse(channelUniverse)
  }

  return changed
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  removeUniverse(channelUniverse)
  channelUniverse.fill(0)
  loadChannelsFromState()
}

export function init(): void {
  const start = Date.now()
  channelUniverse = createUniverse()
  loadChannelsFromState()

  controlRegistry.register({ reload })
  registerApiMessageHandler('channels', handleApiMessage)

  howLong(start, 'initChannels')
}
