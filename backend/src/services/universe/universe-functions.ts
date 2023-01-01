import { mapFixtureStateToChannels } from '@vlight/controls'
import { Dictionary, FixtureState } from '@vlight/types'

import { universeSize } from '../config'
import { masterDataMaps } from '../masterdata'

import {
  computeAndBroadcastDmxChannelChange,
  computeUniverseChannelRawValueChange,
  getFinalChannelValue,
} from './computing'
import { universes, universeStates } from './state'
import { Universe, UniverseState } from './types'
import {
  getUniverseIndex,
  getChannelFromUniverseIndex,
  writeUniverseChannel,
} from './utils'

/**
 * Creates a DMX universe, optionally filling it with the values of the given fixture states.
 */
export function createUniverse(
  fixtureStates?: Dictionary<FixtureState>
): Universe {
  const universe = Buffer.alloc(universeSize)

  if (fixtureStates) {
    Object.entries(fixtureStates).forEach(([fixtureId, state]) => {
      const fixture = masterDataMaps.fixtures.get(fixtureId)
      if (!fixture) return
      const { channel } = fixture
      const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)!

      mapFixtureStateToChannels(fixtureType, state).forEach((value, offset) => {
        const index = getUniverseIndex(channel) + offset
        if (universe[index] < value) {
          universe[index] = value
        }
      })
    })
  }

  return universe
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
  const index = getUniverseIndex(channel)
  const oldValue = universe[index]
  if (!writeUniverseChannel(universe, channel, value)) return false

  if (!universes.has(universe)) return true

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

  universe1.forEach((_, index) => {
    const channel = getChannelFromUniverseIndex(index)

    if (setUniverseChannel(universe1, channel, universe2[index])) {
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
 * Creates a copy of the given universe.
 */
export function cloneUniverse(universe: Universe): Universe {
  return Buffer.from(universe)
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
