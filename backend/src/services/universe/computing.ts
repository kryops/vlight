import { ChannelType, channelMappingsAffectedByMaster } from '@vlight/controls'
import { ApiDmxMasterMessage } from '@vlight/types'
import { createRangeArray } from '@vlight/utils'

import { registerApiMessageHandler } from '../api/registry'
import { masterData, masterDataMaps } from '../masterdata'
import { getPersistedState } from '../state'

import {
  universeStates,
  rawDmxUniverse,
  universes,
  dmxUniverse,
  dmxUniverseAfterMaster,
  dmxMasterState,
} from './state'
import { Universe } from './types'
import {
  getUniverseIndex,
  applyMasterValue,
  writeUniverseChannel,
  broadcastUniverseChannel,
} from './utils'
import { refreshOutgoingFadeInterval } from './outgoing-fading'

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

/**
 * Applies the DMX master value to the given channel.
 *
 * @returns whether the final outgoing DMX value was changed.
 */
function applyDmxMaster(channel: number): boolean {
  const universeIndex = getUniverseIndex(channel)
  const rawValue = rawDmxUniverse[universeIndex]
  const newValue = fadedChannels.has(channel)
    ? applyMasterValue(rawValue, dmxMasterState.value)
    : rawValue

  const valueChanged = writeUniverseChannel(
    dmxUniverseAfterMaster,
    channel,
    newValue
  )

  if (!valueChanged) return false

  // if the outgoing universe is faded, we don't change anything here
  if (dmxMasterState.fade) {
    return false
  } else {
    return writeUniverseChannel(dmxUniverse, channel, newValue)
  }
}

/**
 * Applies the given value to the raw (non-faded) DMX universe
 * and broadcasts the channel to API clients and devices if the final outgoing
 * DMX universe changed.
 *
 * @returns whether the final outgoing DMX universe changed.
 */
function setRawDmxValue(channel: number, value: number): boolean {
  if (!writeUniverseChannel(rawDmxUniverse, channel, value)) return false

  const changedDmx = applyDmxMaster(channel)
  if (changedDmx) {
    broadcastUniverseChannel(channel)
  }
  return changedDmx
}

export function handleDmxMasterApiMessage(
  message: ApiDmxMasterMessage
): boolean {
  const { value, fade } = message
  let changed = false

  if (fade !== undefined && dmxMasterState.fade !== fade) {
    dmxMasterState.fade = fade
    changed = true

    refreshOutgoingFadeInterval()
  }

  if (value !== undefined && dmxMasterState.value !== value) {
    dmxMasterState.value = value

    fadedChannels.forEach(channel => {
      if (applyDmxMaster(channel)) {
        broadcastUniverseChannel(channel)
      }
    })

    changed = true
  }

  return changed
}

/**
 * Initializes caches for the relationships of DMX channels with regard to their
 * fixture's master channel in order to speed up universe computations.
 */
export function initUniverseComputingData(isReload = false): void {
  affectedChannelsByMasterChannel.clear()
  masterChannelByChannel.clear()
  fadedChannels.clear()

  if (!isReload) {
    dmxMasterState.value = getPersistedState().dmxMaster
    dmxMasterState.fade = getPersistedState().dmxMasterFade
  }

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
    fadedChannels.add(masterChannel)

    const affectedChannels = createRangeArray(
      fixture.channel,
      fixture.channel + fixtureType.mapping.length - 1
    ).filter(channel => {
      const index = channel - fixture.channel
      const mapping = fixtureType.mapping[index]
      return channelMappingsAffectedByMaster.has(mapping)
    })

    affectedChannelsByMasterChannel.set(masterChannel, affectedChannels)
    affectedChannels.forEach(channel =>
      masterChannelByChannel.set(channel, masterChannel)
    )
  }

  refreshOutgoingFadeInterval()

  if (!isReload) {
    registerApiMessageHandler('dmx-master', handleDmxMasterApiMessage)
  }
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
  const universeState = universeStates.get(universe)
  const universeMasterChannelValue = universeState?.masterValue
  const universeForceMaster = universeState?.forceMaster

  if (
    universeMasterChannelValue !== undefined &&
    universeMasterChannelValue !== 255 &&
    (fadedChannels.has(channel) || universeForceMaster)
  ) {
    if (universeMasterChannelValue === 0) return 0
    factor *= universeMasterChannelValue / 255
  }

  // If the channel is affected by the fixture's master channel, we check if the master channel is set higher
  // in a different universe and reduce the channel's value accordingly
  if (universes.size > 1) {
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
  }

  return factor === 1 ? value : Math.round(value * factor)
}

/**
 * Recomputes the outgoing DMX value for the given channel by iterating over all
 * universes and finding the highest value.
 *
 * Broadcasts the channel to all devices and API clients if changed.
 *
 * Returns whether the outgoing value was changed.
 *
 * To react to channel changes, use {@link computeAndBroadcastDmxChannelChange} instead.
 */
export function recomputeAndBroadcastDmxChannel(channel: number): boolean {
  let newValue = 0

  for (const universe of universes) {
    const value = getFinalChannelValue(universe, channel)
    if (value > newValue) newValue = value

    if (value === 255) break
  }

  return setRawDmxValue(channel, newValue)
}

/**
 * Recomputes the final outgoing DMX value of the given channel after a value change.
 *
 * Takes many shortcuts if it can determine that the outgoing DMX value will not change.
 *
 * Broadcasts the channel to all devices and API clients if changed.
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
    return setRawDmxValue(channel, finalNewUniverseValue)
  }

  // Now, the only thing we can do is to iterate over all universes and find the highest value.
  // We cannot take a shortcut here if there is only a single universe active, as this function
  // is also called after removing a universe.

  return recomputeAndBroadcastDmxChannel(channel)
}

export interface ComputeAndBroadcastDmxChannelChangeArgs {
  channel: number
  newValue: number
  oldValue: number
  skipAffectedChannels?: boolean
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
export function computeAndBroadcastDmxChannelChange({
  channel,
  newValue,
  oldValue,
  skipAffectedChannels = false,
}: ComputeAndBroadcastDmxChannelChangeArgs): boolean {
  const changedDmx = computeDmxChannelChange(channel, newValue, oldValue)

  // We need to recompute all affected channels even if the outgoing DMX value did not change
  // as it might affect their multiplying factors.
  if (!skipAffectedChannels) {
    affectedChannelsByMasterChannel
      .get(channel)
      ?.forEach(affectedChannel =>
        recomputeAndBroadcastDmxChannel(affectedChannel)
      )
  }

  return changedDmx
}

export interface ComputeUniverseChannelRawValueChangeArgs
  extends ComputeAndBroadcastDmxChannelChangeArgs {
  universe: Universe
}

/**
 * Recomputes the final outgoing DMX value of the given channel after a value change,
 * and broadcasts it to all devices and API clients if changed.
 *
 * Also recomputes any affected/dependent channels.
 *
 * Takes the raw new and old universe values as arguments.
 */
export function computeUniverseChannelRawValueChange({
  universe,
  channel,
  newValue,
  oldValue,
  skipAffectedChannels = false,
}: ComputeUniverseChannelRawValueChangeArgs): boolean {
  if (newValue === oldValue) return false

  return computeAndBroadcastDmxChannelChange({
    channel,
    newValue: getFinalChannelValue(universe, channel, newValue),
    oldValue: getFinalChannelValue(universe, channel, oldValue),
    skipAffectedChannels,
  })
}
