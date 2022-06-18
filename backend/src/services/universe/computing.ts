import { ChannelType, channelMappingsAffectedByMaster } from '@vlight/controls'
import { createRangeArray } from '@vlight/utils'

import { broadcastUniverseChannelToDevices } from '../../devices'
import { broadcastUniverseChannelToApiClients } from '../api'
import { masterData, masterDataMaps } from '../masterdata'

import { universeStates, dmxUniverse, universes } from './state'
import { Universe } from './types'
import { getUniverseIndex, assertValidChannel } from './utils'

const affectedChannelsByMasterChannel = new Map<number, number[]>()
const masterChannelByChannel = new Map<number, number>()
const fadedChannels = new Set<number>()

export function initUniverseComputingData(): void {
  affectedChannelsByMasterChannel.clear()
  masterChannelByChannel.clear()
  fadedChannels.clear()

  for (const fixture of masterData.fixtures) {
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
    if (!fixtureType) continue

    const masterIndex = fixtureType.mapping.indexOf(ChannelType.Master)
    if (masterIndex === -1) {
      for (let offset = 0; offset < fixtureType.mapping.length; offset++) {
        fadedChannels.add(fixture.channel + offset)
      }
      continue
    }

    const masterChannel = fixture.channel + masterIndex
    const affectedChannels = createRangeArray(
      fixture.channel,
      fixture.channel + fixtureType.mapping.length - 1
    ).filter(channel => {
      const index = channel - fixture.channel
      const mapping = fixtureType.mapping[index]
      if (channelMappingsAffectedByMaster.has(mapping)) {
        return true
      } else {
        fadedChannels.add(channel)
        return false
      }
    })

    affectedChannelsByMasterChannel.set(masterChannel, affectedChannels)
    affectedChannels.forEach(channel =>
      masterChannelByChannel.set(channel, masterChannel)
    )
  }
}

/**
 * returns the universe's channel value
 * - corrected for master channel across all universes
 * - with its masterValue applied if the channel is faded
 */
export function getFinalChannelValue(
  universe: Universe,
  channel: number,
  overrideValue?: number
): number {
  const value = overrideValue ?? universe[getUniverseIndex(channel)]

  if (value === 0) return value

  let factor = 1

  // we apply the masterValue first, which is necessary for the affecting master channel later
  const universeMasterChannelValue = universeStates.get(universe)?.masterValue
  const universeforceMaster = universeStates.get(universe)?.forceMaster
  if (
    universeMasterChannelValue !== undefined &&
    universeMasterChannelValue !== 255 &&
    (fadedChannels.has(channel) || universeforceMaster)
  ) {
    factor *= universeMasterChannelValue / 255
  }

  const affectingMasterChannel = masterChannelByChannel.get(channel)
  if (affectingMasterChannel && !universeforceMaster) {
    const highestMaster = dmxUniverse[getUniverseIndex(affectingMasterChannel)]
    const sameUniverseMaster = getFinalChannelValue(
      universe,
      affectingMasterChannel
    )
    if (sameUniverseMaster < highestMaster) {
      factor *= sameUniverseMaster / highestMaster
    }
  }

  return factor === 1 ? value : Math.round(value * factor)
}

function broadcastUniverseChannel(channel: number) {
  broadcastUniverseChannelToDevices(
    channel,
    dmxUniverse[getUniverseIndex(channel)]
  )
  broadcastUniverseChannelToApiClients(channel)
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

  if (!universes.has(universe)) return true

  computeUniverseChannelRawValueChange(universe, channel, value, oldValue)

  return true
}

function computeDmxChannelChange(
  channel: number,
  finalNewUniverseValue: number,
  finalOldUniverseValue: number
): boolean {
  if (finalNewUniverseValue === finalOldUniverseValue) {
    return false
  }

  const index = getUniverseIndex(channel)
  const currentDmxValue = dmxUniverse[index]

  if (finalNewUniverseValue === currentDmxValue) {
    return false
  }

  // no change because another universe has the highest value
  if (
    finalOldUniverseValue < currentDmxValue &&
    finalNewUniverseValue < currentDmxValue
  ) {
    return false
  }

  if (finalNewUniverseValue > currentDmxValue) {
    dmxUniverse[index] = finalNewUniverseValue
    return true
  }

  let newDmxValue = finalNewUniverseValue

  for (const universe of universes) {
    const universeValue = getFinalChannelValue(universe, channel)
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

export function computeAndBroadcastDmxChannelChange(
  channel: number,
  finalNewUniverseValue: number,
  finalOldUniverseValue: number
): boolean {
  const changedDmx = computeDmxChannelChange(
    channel,
    finalNewUniverseValue,
    finalOldUniverseValue
  )

  if (changedDmx) {
    broadcastUniverseChannel(channel)
  }

  affectedChannelsByMasterChannel
    .get(channel)
    ?.forEach(affectedChannel =>
      recomputeAndBroadcastDmxChannel(affectedChannel)
    )

  return changedDmx
}

function recomputeDmxChannel(channel: number): boolean {
  const index = getUniverseIndex(channel)
  const oldValue = dmxUniverse[index]
  let newValue = 0

  for (const universe of universes) {
    const value = getFinalChannelValue(universe, channel)
    if (value > newValue) newValue = value

    if (value === 255) break
  }

  if (oldValue !== newValue) {
    dmxUniverse[index] = newValue
    return true
  }
  return false
}

export function recomputeAndBroadcastDmxChannel(channel: number): boolean {
  const changedDmx = recomputeDmxChannel(channel)
  if (changedDmx) broadcastUniverseChannel(channel)
  return changedDmx
}

export function computeUniverseChannelRawValueChange(
  universe: Universe,
  channel: number,
  rawValue: number,
  rawOldValue: number
): void {
  if (rawValue === rawOldValue) return

  computeAndBroadcastDmxChannelChange(
    channel,
    getFinalChannelValue(universe, channel, rawValue),
    getFinalChannelValue(universe, channel, rawOldValue)
  )
}
