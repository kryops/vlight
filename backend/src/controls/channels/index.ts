import { ApiChannelMessage } from '@vlight/types'
import { logger } from '@vlight/utils'

import { universeSize } from '../../services/config'
import { getPersistedState } from '../../services/state'
import {
  addUniverse,
  createUniverse,
  Universe,
  removeUniverse,
  isUniverseEmpty,
  isUniverseChannelFading,
  setUniverseChannels,
  setUniverseChannelsFrom,
  stopUniverseChannelFades,
} from '../../services/universe'
import { getUniverseIndex } from '../../services/universe/utils'
import { howLong } from '../../util/time'
import { controlRegistry } from '../registry'
import { registerApiMessageHandler } from '../../services/api/registry'

/**
 * The state of the channel controls.
 *
 * Changes are applied immediately, while the {@link outgoingUniverse} may be faded.
 */
export let channelUniverse: Universe

/** The outgoing DMX universe for the channel controls, which may be faded. */
let outgoingUniverse: Universe

function loadChannelsFromState() {
  for (const [index, value] of Object.entries(getPersistedState().channels)) {
    channelUniverse[+index] = value
  }

  setUniverseChannelsFrom(outgoingUniverse, channelUniverse)
  if (!isUniverseEmpty(channelUniverse)) {
    addUniverse(outgoingUniverse)
  }
}

/** Removes the outgoing universe if all channels are 0 and nothing is fading anymore. */
function removeUniverseIfUnused() {
  if (
    isUniverseEmpty(channelUniverse) &&
    !isUniverseChannelFading(outgoingUniverse)
  ) {
    removeUniverse(outgoingUniverse)
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
    addUniverse(outgoingUniverse)
  }

  for (const [channel, value] of entries) {
    const index = getUniverseIndex(+channel)
    if (channelUniverse[index] !== value) {
      channelUniverse[index] = value
      changed = true
    }
  }

  const values = entries.map(([channel, value]): [number, number] => [
    +channel,
    value,
  ])
  setUniverseChannels(outgoingUniverse, values, {
    fade: message.fade,
    onFinished: removeUniverseIfUnused,
  })

  if (!setsValues) removeUniverseIfUnused()

  return changed
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  stopUniverseChannelFades(outgoingUniverse)
  removeUniverse(outgoingUniverse)
  channelUniverse.fill(0)
  outgoingUniverse.fill(0)
  loadChannelsFromState()
}

export function init(): void {
  const start = Date.now()
  channelUniverse = createUniverse()
  outgoingUniverse = createUniverse()
  loadChannelsFromState()

  controlRegistry.register({ reload })
  registerApiMessageHandler('channels', handleApiMessage)

  howLong(start, 'initChannels')
}
