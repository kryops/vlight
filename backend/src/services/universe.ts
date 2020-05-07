import { broadcastUniverseChannelToDevices } from '../devices'
import { addToMutableArray, removeFromMutableArray } from '../util/shared'

import { universeSize } from './config'
import { broadcastUniverseChannelToApiClients } from './api'

export type Universe = Buffer

const dmxUniverse = createUniverse()

const universes: Universe[] = []

function assertValidChannel(channel: number) {
  if (channel < 1 || channel > universeSize) {
    throw new Error(`invalid channel: ${channel}`)
  }
}

function computeDmxChannel(
  channel: number,
  newUniverseValue: number,
  oldUniverseValue: number
): boolean {
  if (newUniverseValue === oldUniverseValue) {
    return false
  }

  const index = getUniverseIndex(channel)
  const currentDmxValue = dmxUniverse[index]

  if (newUniverseValue === currentDmxValue) {
    return false
  }

  // no change because another universe has the highest value
  if (
    oldUniverseValue < currentDmxValue &&
    newUniverseValue < currentDmxValue
  ) {
    return false
  }

  if (newUniverseValue > currentDmxValue) {
    dmxUniverse[index] = newUniverseValue
    return true
  }

  let newDmxValue = newUniverseValue

  for (const universe of universes) {
    const universeValue = universe[index]
    // shortcut: If any universe is set to 255, the overall value will not have changed.
    // value can't be 255 here, as that would have been >= currentValue
    if (universeValue === 255) {
      return false
    }
    if (universeValue > newDmxValue) {
      newDmxValue = universeValue
    }
  }

  if (newDmxValue === currentDmxValue) {
    return false
  }

  dmxUniverse[index] = newDmxValue
  return true
}

function computeAndBroadcastDmxChannel(
  channel: number,
  newUniverseValue: number,
  oldUniverseValue: number
): boolean {
  const changedDmx = computeDmxChannel(
    channel,
    newUniverseValue,
    oldUniverseValue
  )

  if (changedDmx) {
    broadcastUniverseChannelToDevices(channel, newUniverseValue)
    broadcastUniverseChannelToApiClients(channel)
  }

  return changedDmx
}

export function setUniverseChannel(
  universe: Buffer,
  channel: number,
  value: number
): boolean {
  assertValidChannel(channel)
  const index = getUniverseIndex(channel)
  const oldValue = universe[index]

  if (oldValue === value) {
    return false
  }

  universe[index] = value

  if (!universes.includes(universe)) return true

  computeAndBroadcastDmxChannel(channel, value, oldValue)

  return true
}

/**
 * Export as function instead of the variable directly
 * so we can add blackout/swop features later
 */
export function getDmxUniverse(): Buffer {
  return dmxUniverse
}

export function createUniverse(): Universe {
  return Buffer.alloc(universeSize)
}

export function addUniverse(universe: Universe) {
  addToMutableArray(universes, universe)
  if (universe.some(x => x !== 0)) {
    universe.forEach((value, index) =>
      computeAndBroadcastDmxChannel(
        getChannelFromUniverseIndex(index),
        value,
        0
      )
    )
  }
}

export function removeUniverse(universe: Universe) {
  removeFromMutableArray(universes, universe)
  if (universe.some(x => x !== 0)) {
    universe.forEach((value, index) =>
      computeAndBroadcastDmxChannel(
        getChannelFromUniverseIndex(index),
        0,
        value
      )
    )
  }
}

export function getUniverseIndex(channel: number) {
  return channel - 1
}

export function getChannelFromUniverseIndex(index: number) {
  return index + 1
}
