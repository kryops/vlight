import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
} from './index'

export let channelUniverse: Universe

export function setChannel(channel: number, value: number) {
  return setUniverseChannel(channelUniverse, channel, value)
}

export function initChannels() {
  channelUniverse = createUniverse()
  addUniverse(channelUniverse)
}
