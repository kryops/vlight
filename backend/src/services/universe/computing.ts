import {
  ChannelType,
  getFixtureTypeSegments,
  getMasterDependentChannels,
} from '@vlight/controls'
import { ApiDmxMasterMessage } from '@vlight/types'
import { createRangeArray } from '@vlight/utils'

import { registerApiMessageHandler } from '../api/registry'
import { masterData, masterDataMaps } from '../masterdata'
import { getPersistedState } from '../state'

import {
  universeStates,
  baseDmxUniverse,
  rawDmxUniverse,
  overrideWeights,
  overridesDimmedByMaster,
  activeOverrides,
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
import { refreshOutgoingFade } from './outgoing-fading'

/**
 * A list of channels for each master channel that are affected by it.
 */
const affectedChannelsByMasterChannel = new Map<number, number[]>()

/**
 * A reference to the master channel for all channels that are affected by it.
 */
const masterChannelByChannel = new Map<number, number>()

/**
 * Channels that are faded by a universe's master value and the global DMX master. Contains
 * - The master-dependent channels of fixtures without a master channel
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

/**
 * Returns the blend factor (0-1) of an overriding universe for the given universe index.
 */
function getOverrideFactor(universe: Universe, index: number): number {
  const weight = overrideWeights.get(universe)?.[index] ?? 0
  if (weight === 0) return 0
  if (overridesDimmedByMaster.has(universe)) return weight / 255
  const masterValue = universeStates.get(universe)?.masterValue ?? 255
  return (weight / 255) * (masterValue / 255)
}

/**
 * Returns the value of an overriding universe for the given channel.
 *
 * Universes dimmed by their master value apply it like merged universes do.
 */
function getOverrideValue(universe: Universe, channel: number): number {
  const value = universe[getUniverseIndex(channel)]
  if (!overridesDimmedByMaster.has(universe)) return value
  const state = universeStates.get(universe)
  return fadedChannels.has(channel) || state?.forceMaster
    ? applyMasterValue(value, state?.masterValue ?? 255)
    : value
}

/**
 * Blends all active overriding universes on top of the given base value of a channel.
 *
 * Master-dependent channels of fixtures with a master channel are blended by their
 * effective brightness (value * master), so that
 * - fading in an override over a dark fixture does not dim it twice
 * - overriding only the shared master channel of a fixture keeps the effective
 *   brightness of its other channels
 */
function applyOverrides(channel: number, baseValue: number): number {
  if (activeOverrides.length === 0) return baseValue

  const index = getUniverseIndex(channel)
  const masterChannel = masterChannelByChannel.get(channel)

  // simple linear blending
  let linearValue = baseValue
  let changed = false
  for (const universe of activeOverrides) {
    const factor = getOverrideFactor(universe, index)
    if (factor === 0) continue
    changed = true
    linearValue += (getOverrideValue(universe, channel) - linearValue) * factor
  }

  if (masterChannel === undefined) {
    return changed ? Math.round(linearValue) : baseValue
  }

  const masterIndex = getUniverseIndex(masterChannel)
  let master = baseDmxUniverse[masterIndex]
  let effective = (baseValue * master) / 255

  for (const universe of activeOverrides) {
    const factor = getOverrideFactor(universe, index)
    const masterFactor = getOverrideFactor(universe, masterIndex)
    if (factor === 0 && masterFactor === 0) continue
    changed = true
    const overrideMaster = getOverrideValue(universe, masterChannel)
    master += (overrideMaster - master) * masterFactor
    effective +=
      ((getOverrideValue(universe, channel) * overrideMaster) / 255 -
        effective) *
      factor
  }

  if (!changed) return baseValue

  const roundedMaster = Math.round(master)
  if (roundedMaster === 0) return Math.round(linearValue)
  return Math.min(255, Math.round((effective * 255) / roundedMaster))
}

/**
 * Applies the given value to the base DMX universe, then applies all overrides
 * to compute the raw DMX value.
 *
 * @returns whether the final outgoing DMX universe changed.
 */
function setBaseDmxValue(channel: number, value: number): boolean {
  writeUniverseChannel(baseDmxUniverse, channel, value)
  return setRawDmxValue(channel, applyOverrides(channel, value))
}

/**
 * Recomputes the given channel after a change of an overriding universe
 * (values, weights, or master value).
 *
 * Also recomputes the channels affected by it if it is a master channel.
 */
export function recomputeOverriddenChannel(channel: number): void {
  setRawDmxValue(
    channel,
    applyOverrides(channel, baseDmxUniverse[getUniverseIndex(channel)])
  )
  affectedChannelsByMasterChannel
    .get(channel)
    ?.forEach(affectedChannel =>
      setRawDmxValue(
        affectedChannel,
        applyOverrides(
          affectedChannel,
          baseDmxUniverse[getUniverseIndex(affectedChannel)]
        )
      )
    )
}

export function handleDmxMasterApiMessage(
  message: ApiDmxMasterMessage
): boolean {
  const { value, fade } = message
  let changed = false

  if (fade !== undefined && dmxMasterState.fade !== fade) {
    dmxMasterState.fade = fade
    changed = true

    refreshOutgoingFade()
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
    const masterDependentChannels = getMasterDependentChannels(fixtureType)

    const affectedChannels = createRangeArray(
      fixture.channel,
      fixture.channel + fixtureType.mapping.length - 1
    ).filter(channel => {
      const index = channel - fixture.channel
      const mapping = fixtureType.mapping[index]
      return masterDependentChannels.has(mapping)
    })

    // Fixture has no master -> master-dependent channels are faded by the universe's master
    if (masterIndex === -1) {
      affectedChannels.forEach(channel => fadedChannels.add(channel))
      continue
    }

    // Fixtures with segments may have a separate master channel for each segment
    const segments = getFixtureTypeSegments(fixtureType)
    const getMasterIndex = (index: number) => {
      const segment = segments?.segmentByMappingIndex[index]
      return segments?.masterPerSegment && segment !== undefined
        ? segments.masterIndexBySegment[segment]
        : masterIndex
    }

    fixtureType.mapping.forEach((channelType, index) => {
      if (channelType !== ChannelType.Master) return
      const masterChannel = fixture.channel + index
      fadedChannels.add(masterChannel)
      affectedChannelsByMasterChannel.set(masterChannel, [])
    })

    for (const channel of affectedChannels) {
      const masterChannel =
        fixture.channel + getMasterIndex(channel - fixture.channel)
      affectedChannelsByMasterChannel.get(masterChannel)?.push(channel)
      masterChannelByChannel.set(channel, masterChannel)
    }
  }

  refreshOutgoingFade()

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
        baseDmxUniverse[getUniverseIndex(affectingMasterChannel)]
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
 * non-overriding universes and finding the highest value, then applying all overrides.
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
    if (overrideWeights.has(universe)) continue
    const value = getFinalChannelValue(universe, channel)
    if (value > newValue) newValue = value

    if (value === 255) break
  }

  return setBaseDmxValue(channel, newValue)
}

/**
 * Recomputes the final outgoing DMX value of the given channel after a value change
 * of a non-overriding universe.
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
  const currentDmxValue = baseDmxUniverse[index]

  // If the new value is identical to the current base value, it cannot change
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
    return setBaseDmxValue(channel, finalNewUniverseValue)
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

export interface ComputeUniverseChannelRawValueChangeArgs extends ComputeAndBroadcastDmxChannelChangeArgs {
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
