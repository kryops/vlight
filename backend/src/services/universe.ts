import {
  addToMutableArray,
  createRangeArray,
  removeFromMutableArray,
} from '@vlight/utils'
import { ChannelMapping } from '@vlight/controls'

import { broadcastUniverseChannelToDevices } from '../devices'
import { howLong } from '../util/time'

import { universeSize } from './config'
import { broadcastUniverseChannelToApiClients } from './api'
import { masterData, masterDataMaps } from './masterdata'

export type Universe = Buffer

const dmxUniverse = createUniverse()

const universes: Universe[] = []

const affectedChannelsByMasterChannel = new Map<number, number[]>()
const masterChannelByChannel = new Map<number, number>()

function initMasterChannelMaps() {
  for (const fixture of masterData.fixtures) {
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
    if (!fixtureType) continue

    const masterIndex = fixtureType.mapping.indexOf(ChannelMapping.Master)
    if (masterIndex === -1) continue

    const masterChannel = fixture.channel + masterIndex
    const affectedChannels = createRangeArray(
      fixture.channel,
      fixture.channel + fixtureType.mapping.length - 1
    ).filter(channel => channel !== masterChannel)

    affectedChannelsByMasterChannel.set(masterChannel, affectedChannels)
    affectedChannels.forEach(channel =>
      masterChannelByChannel.set(channel, masterChannel)
    )
  }
}

function broadcastUniverseChannel(channel: number) {
  broadcastUniverseChannelToDevices(
    channel,
    dmxUniverse[getUniverseIndex(channel)]
  )
  broadcastUniverseChannelToApiClients(channel)
}

function assertValidChannel(channel: number) {
  if (channel < 1 || channel > universeSize) {
    throw new Error(`invalid channel: ${channel}`)
  }
}

function getChannelValueCorrectedForMaster(
  universe: Universe,
  channel: number,
  value: number
) {
  if (value === 0) return value

  const affectingMasterChannel = masterChannelByChannel.get(channel)
  if (!affectingMasterChannel) return value

  const masterIndex = getUniverseIndex(affectingMasterChannel)
  const highestMaster = dmxUniverse[masterIndex]
  const sameUniverseMaster = universe[masterIndex]

  if (sameUniverseMaster >= highestMaster) return value

  const factor = sameUniverseMaster / highestMaster
  return Math.round(value * factor)
}

function computeDmxChannelChange(
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
    const universeValue = getChannelValueCorrectedForMaster(
      universe,
      getChannelFromUniverseIndex(index),
      universe[index]
    )
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

function computeAndBroadcastDmxChannelChange(
  channel: number,
  newUniverseValue: number,
  oldUniverseValue: number
): boolean {
  const changedDmx = computeDmxChannelChange(
    channel,
    newUniverseValue,
    oldUniverseValue
  )

  if (changedDmx) {
    broadcastUniverseChannel(channel)
  }

  return changedDmx
}

function recomputeDmxChannel(channel: number): boolean {
  const index = getUniverseIndex(channel)
  const oldValue = dmxUniverse[index]
  let newValue = 0

  for (const universe of universes) {
    const value = getChannelValueCorrectedForMaster(
      universe,
      channel,
      universe[index]
    )
    if (value > newValue) newValue = value

    if (value === 255) break
  }

  if (oldValue !== newValue) {
    dmxUniverse[index] = newValue
    return true
  }
  return false
}

function recomputeAndBroadcastDmxChannel(channel: number): boolean {
  const changedDmx = recomputeDmxChannel(channel)
  if (changedDmx) broadcastUniverseChannel(channel)
  return changedDmx
}

function computeUniverseChannelChange(
  universe: Universe,
  channel: number,
  value: number,
  oldValue: number
) {
  const finalNewValue = getChannelValueCorrectedForMaster(
    universe,
    channel,
    value
  )
  const finalOldValue = getChannelValueCorrectedForMaster(
    universe,
    channel,
    oldValue
  )
  const changedOutgoing = computeAndBroadcastDmxChannelChange(
    channel,
    finalNewValue,
    finalOldValue
  )

  if (changedOutgoing) {
    affectedChannelsByMasterChannel
      .get(channel)
      ?.forEach(affectedChannel =>
        recomputeAndBroadcastDmxChannel(affectedChannel)
      )
  }
}

export function setUniverseChannel(
  universe: Universe,
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

  computeUniverseChannelChange(universe, channel, value, oldValue)

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

export function addUniverse(universe: Universe): void {
  addToMutableArray(universes, universe)
  if (universe.some(x => x !== 0)) {
    universe.forEach((value, index) => {
      if (value !== 0)
        computeUniverseChannelChange(
          universe,
          getChannelFromUniverseIndex(index),
          value,
          0
        )
    })
  }
}

export function removeUniverse(universe: Universe): void {
  removeFromMutableArray(universes, universe)
  if (universe.some(x => x !== 0)) {
    universe.forEach((value, index) => {
      if (value !== 0)
        computeUniverseChannelChange(
          universe,
          getChannelFromUniverseIndex(index),
          0,
          value
        )
    })
  }
}

export function mergeUniverse(universe1: Universe, universe2: Universe): void {
  universe1.forEach((value, index) => {
    const newValue = universe2[index]
    if (newValue !== value) {
      setUniverseChannel(
        universe1,
        getChannelFromUniverseIndex(index),
        newValue
      )
    }
  })
}

export function getUniverseIndex(channel: number): number {
  return channel - 1
}

export function getChannelFromUniverseIndex(index: number): number {
  return index + 1
}

export function reloadUniverse(): void {
  affectedChannelsByMasterChannel.clear()
  masterChannelByChannel.clear()
  initMasterChannelMaps()
  for (let channel = 1; channel <= universeSize; channel++) {
    recomputeAndBroadcastDmxChannel(channel)
  }
}

export async function initUniverse(): Promise<void> {
  const start = Date.now()

  initMasterChannelMaps()

  howLong(start, 'initUniverse')
}
