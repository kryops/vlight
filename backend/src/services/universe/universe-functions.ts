import { writeFixtureStatesToUniverse } from '@vlight/controls'
import { Dictionary, FixtureState } from '@vlight/types'

import { universeSize } from '../config'
import { masterDataMaps } from '../masterdata'

import {
  computeAndBroadcastDmxChannelChange,
  computeUniverseChannelRawValueChange,
  getFinalChannelValue,
  recomputeOverriddenChannel,
} from './computing'
import {
  activeOverrides,
  overridesDimmedByMaster,
  overrideWeightOwners,
  overrideWeights,
  universes,
  universeStates,
} from './state'
import { Universe, UniverseState } from './types'
import {
  getUniverseIndex,
  getChannelFromUniverseIndex,
  writeUniverseChannel,
} from './utils'

/**
 * Creates a DMX universe, optionally filling it with the values of the given fixture states.
 *
 * The fixture states may also be keyed by segment IDs (`foobar@2`).
 */
export function createUniverse(
  fixtureStates?: Dictionary<FixtureState>
): Universe {
  const universe = Buffer.alloc(universeSize)

  if (fixtureStates) {
    writeFixtureStatesToUniverse(universe, fixtureStates, masterDataMaps)
  }

  return universe
}

/**
 * Returns whether the given universe is active, i.e. part of the outgoing DMX universe.
 *
 * For override weights universes, returns whether their owner is active.
 */
export function isUniverseOrOwnerActive(universe: Universe): boolean {
  return universes.has(overrideWeightOwners.get(universe) ?? universe)
}

/** Recomputes all channels that the given overriding universe has a weight for. */
function recomputeOverrideChannels(weights: Universe) {
  weights.forEach((weight, index) => {
    if (weight !== 0)
      recomputeOverriddenChannel(getChannelFromUniverseIndex(index))
  })
}

/**
 * Sets the DMX value of the given channel in the given universe.
 *
 * Also supports override weights universes (see {@link setUniverseOverride}).
 *
 * Triggers a recomputation of the channel itself and all affected channels.
 */
export function setUniverseChannel(
  universe: Universe,
  channel: number,
  value: number
): boolean {
  const index = getUniverseIndex(channel)
  const oldValue = universe[index]
  if (!writeUniverseChannel(universe, channel, value)) return false

  const weightOwner = overrideWeightOwners.get(universe)
  if (weightOwner) {
    if (universes.has(weightOwner)) recomputeOverriddenChannel(channel)
    return true
  }

  if (!universes.has(universe)) return true

  const weights = overrideWeights.get(universe)
  if (weights) {
    if (weights[index] !== 0) recomputeOverriddenChannel(channel)
    return true
  }

  computeUniverseChannelRawValueChange({
    universe,
    channel,
    newValue: value,
    oldValue,
    skipAffectedChannels: universes.size === 1,
  })

  return true
}

/**
 * Adds the given universe to the list of active universes.
 *
 * Recomputes the outgoing DMX universe accordingly.
 */
export function addUniverse(universe: Universe, state?: UniverseState): void {
  if (universes.has(universe)) {
    if (state) setUniverseState(universe, state)
    return
  }

  universes.add(universe)
  if (state) universeStates.set(universe, state)

  const weights = overrideWeights.get(universe)
  if (weights) {
    activeOverrides.push(universe)
    recomputeOverrideChannels(weights)
    return
  }

  const skipAffectedChannels = universes.size === 1

  universe.forEach((value, index) => {
    if (value !== 0)
      computeUniverseChannelRawValueChange({
        universe,
        channel: getChannelFromUniverseIndex(index),
        newValue: value,
        oldValue: 0,
        skipAffectedChannels,
      })
  })
}

/**
 * Removes the given universe from the list of active universes.
 *
 * Recomputes the outgoing DMX universe accordingly.
 */
export function removeUniverse(universe: Universe): void {
  if (!universes.has(universe)) return

  universes.delete(universe)
  universeStates.delete(universe)

  const weights = overrideWeights.get(universe)
  if (weights) {
    activeOverrides.splice(activeOverrides.indexOf(universe), 1)
    recomputeOverrideChannels(weights)
    return
  }

  const skipAffectedChannels = universes.size === 0

  universe.forEach((value, index) => {
    if (value !== 0)
      computeUniverseChannelRawValueChange({
        universe,
        channel: getChannelFromUniverseIndex(index),
        newValue: 0,
        oldValue: value,
        skipAffectedChannels,
      })
  })
}

/**
 * Overwrites the given universe with the values from the second universe.
 *
 * Recomputes the outgoing DMX universe accordingly.
 */
export function overwriteUniverse(
  universe1: Universe,
  universe2: Universe
): boolean {
  let changed = false

  universe2.forEach((value, index) => {
    const channel = getChannelFromUniverseIndex(index)

    if (setUniverseChannel(universe1, channel, value)) {
      changed = true
    }
  })

  return changed
}

/**
 * Changes the state of the given universe.
 *
 * Recomputes the outgoing DMX universe accordingly.
 */
export function setUniverseState(
  universe: Universe,
  state: UniverseState
): void {
  if (!universes.has(universe)) return

  const oldState = universeStates.get(universe)
  const masterValueChanged =
    'masterValue' in state && oldState?.masterValue !== state.masterValue

  const weights = overrideWeights.get(universe)
  if (weights) {
    universeStates.set(universe, { ...oldState, ...state })
    if (masterValueChanged) recomputeOverrideChannels(weights)
    return
  }

  // to do an efficient diff, we first have to generate the final values for the old masterValue
  const oldFinalChannelValues = new Map<number, number>()
  if (masterValueChanged) {
    universe.forEach((value, index) => {
      if (value !== 0) {
        const channel = getChannelFromUniverseIndex(index)
        oldFinalChannelValues.set(
          channel,
          getFinalChannelValue(universe, channel, value)
        )
      }
    })
  }

  universeStates.set(universe, { ...oldState, ...state })

  if (masterValueChanged) {
    const skipAffectedChannels = universes.size === 1

    universe.forEach((value, index) => {
      if (value !== 0) {
        const channel = getChannelFromUniverseIndex(index)
        computeAndBroadcastDmxChannelChange({
          channel,
          newValue: getFinalChannelValue(universe, channel, value),
          oldValue: oldFinalChannelValues.get(channel)!,
          skipAffectedChannels,
        })
      }
    })
  }
}

/**
 * Makes the given universe override all other universes instead of being merged with them,
 * or reverts it to being merged again (`null`).
 *
 * The weights universe defines the blend factor (0-255) for each channel:
 * - 0: the channel is not overridden
 * - 255: the channel is completely overridden (if the universe's master value is 255)
 *
 * Overriding universes are applied in the order of their activation, i.e. the universe
 * activated last overrides the others.
 *
 * The weights can be changed (and faded) like regular universes afterwards, e.g. through
 * {@link setUniverseChannel} or `setUniverseChannels`.
 *
 * @param dimByMaster the universe's master value dims its own values like for merged universes,
 *   instead of crossfading with the universes below (i.e. they stay overridden at master value 0)
 */
export function setUniverseOverride(
  universe: Universe,
  weights: Universe | null,
  dimByMaster = false
): void {
  const existing = overrideWeights.get(universe)
  const dimByMasterChanged =
    !!weights && overridesDimmedByMaster.has(universe) !== dimByMaster
  if (
    !dimByMasterChanged &&
    (existing === weights || (!existing && !weights))
  ) {
    return
  }

  const active = universes.has(universe)
  const state = universeStates.get(universe)
  if (active) removeUniverse(universe)

  if (existing) overrideWeightOwners.delete(existing)
  if (weights) {
    overrideWeights.set(universe, weights)
    overrideWeightOwners.set(weights, universe)
  } else {
    overrideWeights.delete(universe)
  }
  if (weights && dimByMaster) overridesDimmedByMaster.add(universe)
  else overridesDimmedByMaster.delete(universe)

  if (active) addUniverse(universe, state)
}

/**
 * Moves the given overriding universe on top of all other overriding universes,
 * as if it had just been activated.
 */
export function bringUniverseToFront(universe: Universe): void {
  const weights = overrideWeights.get(universe)
  const index = activeOverrides.indexOf(universe)
  if (!weights || index === -1 || index === activeOverrides.length - 1) return

  activeOverrides.splice(index, 1)
  activeOverrides.push(universe)
  recomputeOverrideChannels(weights)
}

/**
 * Returns a new universe that mixes the two given universes linearly.
 *
 * @param progress from 0 (only `from`) to 1 (only `to`)
 */
export function mixUniverses(
  from: Universe,
  to: Universe,
  progress: number
): Universe {
  const result = Buffer.alloc(from.length)
  for (let index = 0; index < from.length; index++) {
    result[index] = Math.round(
      from[index] + (to[index] - from[index]) * progress
    )
  }
  return result
}

/**
 * Returns a set of channels whose values differ in the two given universes.
 */
export function getDifferentChannels(
  universe1: Buffer,
  universe2: Buffer
): Set<number> {
  const differentChannels = new Set<number>()

  universe1.forEach((value, index) => {
    if (universe2[index] !== value) {
      differentChannels.add(getChannelFromUniverseIndex(index))
    }
  })

  return differentChannels
}

/**
 * Returns whether the given universe is empty, i.e. has all channels set to 0.
 */
export function isUniverseEmpty(universe: Universe): boolean {
  return universe.every(value => value === 0)
}
