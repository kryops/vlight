import { getPersistedState } from '../../database/state'
import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
} from '../../services/universe'
import { howLong } from '../../util/time'

export let channelUniverse: Universe

export function setChannel(channel: number, value: number) {
  return setUniverseChannel(channelUniverse, channel, value)
}

export function initChannels() {
  const start = Date.now()
  channelUniverse = createUniverse()
  for (const [index, value] of Object.entries(getPersistedState().channels)) {
    channelUniverse[+index] = value
  }
  addUniverse(channelUniverse)
  howLong(start, 'initChannels')
}