import { createRangeArray } from '@vlight/utils'
import { ChannelMapping, mapFixtureStateToChannels } from '@vlight/controls'
import { Dictionary, FixtureState } from '@vlight/types'

import { broadcastUniverseChannelToDevices } from '../devices'
import { howLong } from '../util/time'

import { universeSize } from './config'
import { broadcastUniverseChannelToApiClients } from './api'
import { masterData, masterDataMaps } from './masterdata'

export type Universe = Buffer
export interface UniverseState {
  masterValue?: number
}

const dmxUniverse = createUniverse()

const universes = new Set<Universe>()
const universeStates = new Map<Universe, UniverseState>()

const affectedChannelsByMasterChannel = new Map<number, number[]>()
const masterChannelByChannel = new Map<number, number>()
const fadedChannels = new Set<number>()

function initMasterChannelMaps() {
  fadedChannels.clear()

  for (const fixture of masterData.fixtures) {
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
    if (!fixtureType) continue

    const masterIndex = fixtureType.mapping.indexOf(ChannelMapping.Master)
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

/**
 * returns the universe's channel value
 * - corrected for master channel across all universes
 * - with its masterValue applied if the channel is faded
 */
function getFinalChannelValue(
  universe: Universe,
  channel: number,
  overrideValue?: number
) {
  const value = overrideValue ?? universe[getUniverseIndex(channel)]

  if (value === 0) return value

  let factor = 1

  // we apply the masterValue first, which is necessary for the affecting master channel later
  const universeMasterChannelValue = universeStates.get(universe)?.masterValue
  if (
    universeMasterChannelValue !== undefined &&
    universeMasterChannelValue !== 255 &&
    fadedChannels.has(channel)
  ) {
    factor *= universeMasterChannelValue / 255
  }

  const affectingMasterChannel = masterChannelByChannel.get(channel)
  if (affectingMasterChannel) {
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

function computeAndBroadcastDmxChannelChange(
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

    affectedChannelsByMasterChannel
      .get(channel)
      ?.forEach(affectedChannel =>
        recomputeAndBroadcastDmxChannel(affectedChannel)
      )
  }

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

function recomputeAndBroadcastDmxChannel(channel: number): boolean {
  const changedDmx = recomputeDmxChannel(channel)
  if (changedDmx) broadcastUniverseChannel(channel)
  return changedDmx
}

function computeUniverseChannelRawValueChange(
  universe: Universe,
  channel: number,
  rawValue: number,
  rawOldValue: number
) {
  computeAndBroadcastDmxChannelChange(
    channel,
    getFinalChannelValue(universe, channel, rawValue),
    getFinalChannelValue(universe, channel, rawOldValue)
  )
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

/**
 * Export as function instead of the variable directly
 * so we can add blackout/swop features later
 */
export function getDmxUniverse(): Buffer {
  return dmxUniverse
}

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
