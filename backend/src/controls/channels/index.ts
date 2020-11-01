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

export let channelUniverse: Universe

function loadChannels() {
  for (const [index, value] of Object.entries(getPersistedState().channels)) {
    channelUniverse[+index] = value
  }
}

function setChannel(channel: number, value: number) {
  return setUniverseChannel(channelUniverse, channel, value)
}

function handleApiMessage(message: ApiChannelMessage) {
  let changed = false
  for (const [channel, value] of Object.entries(message.channels)) {
    if (setChannel(+channel, value)) {
      changed = true
    }
  }
  return changed
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  removeUniverse(channelUniverse)
  channelUniverse.fill(0)
  loadChannels()
  addUniverse(channelUniverse)
}

export function init(): void {
  const start = Date.now()
  channelUniverse = createUniverse()
  loadChannels()
  addUniverse(channelUniverse)

  controlRegistry.register({ reload })
  registerApiMessageHandler('channels', handleApiMessage)

  howLong(start, 'initChannels')
}
