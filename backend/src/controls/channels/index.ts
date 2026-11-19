import { ApiChannelMessage } from '@vlight/types'
import { logger } from '@vlight/utils'

import { universeSize } from '../../services/config'
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

function isValidChannelEntry([channel, value]: [string, unknown]) {
  const channelNumber = Number(channel)
  return (
    Number.isInteger(channelNumber) &&
    channelNumber >= 1 &&
    channelNumber <= universeSize &&
    Number.isInteger(value) &&
    (value as number) >= 0 &&
    (value as number) <= 255
  )
}

function handleApiMessage(message: ApiChannelMessage): boolean {
  let changed = false

  // ignore invalid input instead of throwing or wrapping values in the universe buffer
  const entries = Object.entries(message.channels ?? {}).filter(entry => {
    const valid = isValidChannelEntry(entry)
    if (!valid) logger.warn('Ignoring invalid channel value', entry)
    return valid
  })

  const setsValues = entries.some(([, value]) => value > 0)

  if (setsValues) {
    addUniverse(channelUniverse)
  }

  for (const [channel, value] of entries) {
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
