import { ChannelType, channelMappingsAffectedByMaster } from '@vlight/controls'
import { ApiDmxMasterMessage } from '@vlight/types'
import { createRangeArray } from '@vlight/utils'

import { broadcastUniverseChannelToDevices } from '../../devices'
import { broadcastUniverseChannelToApiClients } from '../api'
import { registerApiMessageHandler } from '../api/registry'
import { masterData, masterDataMaps } from '../masterdata'
import { getPersistedState } from '../state'

import { universeStates, rawDmxUniverse, universes, dmxUniverse } from './state'
import { Universe } from './types'
import {
  getUniverseIndex,
  assertValidChannel,
  getChannelFromUniverseIndex,
  applyMasterValue,
} from './utils'

/**
 * A list of channels for each master channel that are affected by it.
 */
const affectedChannelsByMasterChannel = new Map<number, number[]>()

/**
 * A reference to the master channel for all channels that are affected by it.
 */
const masterChannelByChannel = new Map<number, number>()

/**
 * Channels that are faded independently of the fixture's master channel. Contains
 * - All channels of fixtures without a master channel
 * - Non-color channels of fixtures with a master channel
 * - The master channel itself
 */
const fadedChannels = new Set<number>()

/** Global DMX master value. */
let dmxMaster = 255

export function getDmxMaster() {
  return dmxMaster
}

/**
 * Applies the DMX master value to the given channel.
 *
 * @returns whether the final outgoing DMX value was changed.
 */
function applyDmxMaster(channel: number): boolean {
  const universeIndex = getUniverseIndex(channel)
  const rawValue = rawDmxUniverse[universeIndex]
  const newValue = fadedChannels.has(channel)
    ? applyMasterValue(rawValue, dmxMaster)
    : rawValue

  const currentValue = dmxUniverse[universeIndex]
  if (currentValue === newValue) return false

  dmxUniverse[universeIndex] = newValue
  return true
}

function handleDmxMasterApiMessage(message: ApiDmxMasterMessage): boolean {
  const { value } = message
  if (dmxMaster === value) return false

  dmxMaster = value

  rawDmxUniverse.forEach((value, index) => {
    if (value === 0) return
    const channel = getChannelFromUniverseIndex(index)

    if (applyDmxMaster(channel)) {
      broadcastUniverseChannel(channel)
    }
  })

  return true
}

/**
 * Initializes caches for the relationships of DMX channels with regard to their
 * fixture's master channel in order to speed up universe computations.
 */
export function initUniverseComputingData(): void {
  affectedChannelsByMasterChannel.clear()
  masterChannelByChannel.clear()
  fadedChannels.clear()
  dmxMaster = getPersistedState().dmxMaster

  for (const fixture of masterData.fixtures) {
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
    if (!fixtureType) continue

    const masterIndex = fixtureType.mapping.indexOf(ChannelType.Master)

    // Fixture has no master -> all channels are faded by the universe's master
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
        // The fixture's master does not affect this channel -> faded by the universe's master
        fadedChannels.add(channel)
        return false
      }
    })

    affectedChannelsByMasterChannel.set(masterChannel, affectedChannels)
    affectedChannels.forEach(channel =>
      masterChannelByChannel.set(channel, masterChannel)
    )
  }

  registerApiMessageHandler('dmx-master', handleDmxMasterApiMessage)
}

/**
 * Returns the final value of a channel within the given universe
 * - corrected for the fixture's master channel across all universes
 *   (if the master channel is higher in a different universe, the channel is faded down in this one)
 * - with the universe's master value applied if the channel is faded
 *
 * @param overrideValue - By default, the universe's current value for this channel is used.
 *  This can be overridden by providing a different value instead.
 */
export function getFinalChannelValue(
  universe: Universe,
  channel: number,
  overrideValue?: number
): number {
  const value = overrideValue ?? universe[getUniverseIndex(channel)]

  if (value === 0) return 0

  let factor = 1

  // Apply the universe's master value first, which is necessary for the affecting master channel later
  const universeMasterChannelValue = universeStates.get(universe)?.masterValue
  const universeForceMaster = universeStates.get(universe)?.forceMaster

  if (
    universeMasterChannelValue !== undefined &&
    universeMasterChannelValue !== 255 &&
    (fadedChannels.has(channel) || universeForceMaster)
  ) {
    factor *= universeMasterChannelValue / 255
  }
  if (factor === 0) return 0

  // If the channel is affected by the fixture's master channel, we check if the master channel is set higher
  // in a different universe and reduce the channel's value accordingly
  const affectingMasterChannel = masterChannelByChannel.get(channel)
  if (affectingMasterChannel && !universeForceMaster) {
    const highestMaster =
      rawDmxUniverse[getUniverseIndex(affectingMasterChannel)]
    const sameUniverseMaster = getFinalChannelValue(
      universe,
      affectingMasterChannel
    )
    if (sameUniverseMaster < highestMaster) {
      factor *= sameUniverseMaster / highestMaster
    }
  }
  if (factor === 0) return 0

  return factor === 1 ? value : Math.round(value * factor)
}

/**
 * Broadcasts the given channel to all
 * - DMX devices
 * - API clients
 */
function broadcastUniverseChannel(channel: number) {
  broadcastUniverseChannelToDevices(
    channel,
    dmxUniverse[getUniverseIndex(channel)]
  )
  broadcastUniverseChannelToApiClients(channel)
}

/**
 * Sets the DMX value of the given channel in the given universe.
 *
 * Triggers a recomputation of the channel itself and all affected channels.
 */
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

/**
 * Recomputes the final outgoing DMX value of the given channel after a value change.
 *
 * Takes many shortcuts if it can determine that the outgoing DMX value will not change.
 *
 * Returns whether anything was actually changed.
 */
function computeDmxChannelChange(
  channel: number,
  finalNewUniverseValue: number,
  finalOldUniverseValue: number
): boolean {
  // If the value itself was not changed, the outgoing DMX universe cannot have changed either
  if (finalNewUniverseValue === finalOldUniverseValue) {
    return false
  }

  const index = getUniverseIndex(channel)
  const currentDmxValue = rawDmxUniverse[index]

  // If the new value is identical to the current outgoing DMX value, it cannot change
  if (finalNewUniverseValue === currentDmxValue) {
    return false
  }

  // If the current outgoing value is higher than both the old and new value, it
  // originates from a different universe and cannot change
  if (
    finalOldUniverseValue < currentDmxValue &&
    finalNewUniverseValue < currentDmxValue
  ) {
    return false
  }

  // If the new value is higher than the current outgoing value, it is the new outgoing value
  if (finalNewUniverseValue > currentDmxValue) {
    rawDmxUniverse[index] = finalNewUniverseValue
    return applyDmxMaster(channel)
  }

  // Now, the only thing we can do is to iterate over all universes and find the highest value

  let newDmxValue = finalNewUniverseValue

  for (const universe of universes) {
    const universeValue = getFinalChannelValue(universe, channel)
    // If any universe is set to 255, the overall value cannot change.
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

  rawDmxUniverse[index] = newDmxValue
  return applyDmxMaster(channel)
}

/**
 * Recomputes the final outgoing DMX value of the given channel after a value change,
 * and broadcasts it to all devices and API clients if changed.
 *
 * Also recomputes any affected/dependent channels.
 *
 * Takes the final new and old values as arguments; for the raw universe values,
 * use {@link computeUniverseChannelRawValueChange} instead.
 */
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

  // We need to recompute all affected channels even if the outgoing DMX value did not change
  // as it might affect their multiplying factors
  affectedChannelsByMasterChannel
    .get(channel)
    ?.forEach(affectedChannel =>
      recomputeAndBroadcastDmxChannel(affectedChannel)
    )

  return changedDmx
}

/**
 * Recomputes the outgoing DMX value for the given channel by iterating over all
 * universes and finding the highest value.
 *
 * Returns whether the outgoing value was changed.
 *
 * To determine whether the outgoing value of a channel changed after a value change,
 * use {@link computeDmxChannelChange} instead.
 */
function recomputeDmxChannel(channel: number): boolean {
  const index = getUniverseIndex(channel)
  const oldValue = rawDmxUniverse[index]
  let newValue = 0

  for (const universe of universes) {
    const value = getFinalChannelValue(universe, channel)
    if (value > newValue) newValue = value

    if (value === 255) break
  }

  if (oldValue !== newValue) {
    rawDmxUniverse[index] = newValue
    return applyDmxMaster(channel)
  }
  return false
}

/**
 * Recomputes the final outgoing DMX value of the given channel,
 * and broadcasts it to all devices and API clients if changed.
 *
 * To react to channel changes, use {@link computeAndBroadcastDmxChannelChange} instead.
 */
export function recomputeAndBroadcastDmxChannel(channel: number): boolean {
  const changedDmx = recomputeDmxChannel(channel)
  if (changedDmx) broadcastUniverseChannel(channel)
  return changedDmx
}

/**
 * Recomputes the final outgoing DMX value of the given channel after a value change,
 * and broadcasts it to all devices and API clients if changed.
 *
 * Also recomputes any affected/dependent channels.
 *
 * Takes the raw new and old universe values as arguments.
 */
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
