import { broadcastUniverseChannelToSockets } from '../api'
import { universeSize } from '../config'
import { broadcastUniverseChannelToDevices } from '../devices'

const dmxUniverse = createUniverse()
export const channelUniverse = createUniverse()

const universes: Buffer[] = [channelUniverse]

function createUniverse() {
  return Buffer.alloc(universeSize)
}

function assertValidChannel(channel: number) {
  if (channel < 1 || channel > universeSize) {
    throw new Error(`invalid channel: ${channel}`)
  }
}

function computeDmxChannel(channel: number): boolean {
  const index = channel - 1
  const currentValue = dmxUniverse[index]
  const newValue = Math.max(...universes.map(universe => universe[index]))

  if (newValue === currentValue) {
    return false
  }

  dmxUniverse[index] = newValue
  return true
}

function updateDmxChannel(channel: number, value: number) {
  const index = channel - 1
  const currentDmxValue = dmxUniverse[index]

  let changed = false

  if (currentDmxValue < value) {
    changed = true
    dmxUniverse[index] = value
  } else if (currentDmxValue > value) {
    changed = computeDmxChannel(channel)
  }

  if (changed) {
    broadcastUniverseChannelToDevices(channel, value)
    broadcastUniverseChannelToSockets(channel)
  }
}

export function getDmxUniverse(): Buffer {
  return dmxUniverse
}

export function setChannel(channel: number, value: number) {
  assertValidChannel(channel)

  const index = channel - 1
  channelUniverse[index] = value

  updateDmxChannel(channel, value)
}
