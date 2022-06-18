import { mapFixtureStateToChannels } from '@vlight/controls'
import { Dictionary, FixtureState } from '@vlight/types'

import { universeSize } from '../config'
import { masterDataMaps } from '../masterdata'

import {
  computeAndBroadcastDmxChannelChange,
  computeUniverseChannelRawValueChange,
  getFinalChannelValue,
  setUniverseChannel,
} from './computing'
import { universes, universeStates } from './state'
import { Universe, UniverseState } from './types'
import { getUniverseIndex, getChannelFromUniverseIndex } from './utils'

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

export function addUniverse(universe: Universe, state?: UniverseState): void {
  if (universes.has(universe)) {
    if (state) setUniverseState(universe, state)
    return
  }

  universes.add(universe)
  if (state) universeStates.set(universe, state)

  universe.forEach((value, index) => {
    if (value !== 0)
      computeUniverseChannelRawValueChange(
        universe,
        getChannelFromUniverseIndex(index),
        value,
        0
      )
  })
}

export function removeUniverse(universe: Universe): void {
  if (!universes.has(universe)) return

  universes.delete(universe)
  universeStates.delete(universe)

  universe.forEach((value, index) => {
    if (value !== 0)
      computeUniverseChannelRawValueChange(
        universe,
        getChannelFromUniverseIndex(index),
        0,
        value
      )
  })
}

export function overwriteUniverse(
  universe1: Universe,
  universe2: Universe
): boolean {
  let changed = false

  universe1.forEach((value, index) => {
    const channel = getChannelFromUniverseIndex(index)
    const newValue = universe2[index]

    if (newValue !== value) {
      setUniverseChannel(universe1, channel, newValue)
      changed = true
    }
  })

  return changed
}

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
    universe.forEach((value, index) => {
      if (value !== 0) {
        const channel = getChannelFromUniverseIndex(index)
        computeAndBroadcastDmxChannelChange(
          channel,
          getFinalChannelValue(universe, channel, value),
          oldFinalChannelValues.get(channel)!
        )
      }
    })
  }
}

export function cloneUniverse(universe: Universe): Universe {
  return Buffer.from(universe)
}

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

export function isUniverseEmpty(universe: Universe): boolean {
  return universe.every(value => value === 0)
}
