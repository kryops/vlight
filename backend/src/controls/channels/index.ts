import { getPersistedState } from '../../services/state'
import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
  removeUniverse,
} from '../../services/universe'
import { howLong } from '../../util/time'

export let channelUniverse: Universe

export function setChannel(channel: number, value: number) {
  return setUniverseChannel(channelUniverse, channel, value)
}

function loadChannels() {
  channelUniverse = createUniverse()
  for (const [index, value] of Object.entries(getPersistedState().channels)) {
    channelUniverse[+index] = value
  }
  addUniverse(channelUniverse)
}

export function initChannels() {
  const start = Date.now()
  loadChannels()
  howLong(start, 'initChannels')
}

export function reloadChannels() {
  removeUniverse(channelUniverse)
  loadChannels()
}
