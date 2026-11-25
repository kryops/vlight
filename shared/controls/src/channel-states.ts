import { FixtureChannelState, MasterDataWithMaps } from '@vlight/types'
import { isTruthy, isUnique } from '@vlight/utils'

import { mapFixtureList } from './fixtures'

/**
 * Returns the name of the state the given channel value belongs to.
 *
 * Expects the states to be sorted by their value.
 */
export function getChannelStateName(
  states: FixtureChannelState[],
  value: number
): string | undefined {
  let result: string | undefined
  for (const state of states) {
    if (state.value > value) break
    result = state.name
  }
  return result
}

/**
 * Returns the unique state names for the given channel value
 * across multiple state tables (e.g. from different fixture types).
 *
 * Tables without a state for the value are ignored.
 */
export function getChannelStateNames(
  stateTables: FixtureChannelState[][],
  value: number
): string[] {
  return stateTables
    .map(states => getChannelStateName(states, value))
    .filter(isTruthy)
    .filter(isUnique)
}

/**
 * Collects the channel state tables of all fixture types of the given fixture list strings,
 * grouped by channel type.
 */
export function getCommonChannelStates(
  fixtureStrings: string[],
  masterDataAndMaps: MasterDataWithMaps
): Record<string, FixtureChannelState[][]> {
  const { masterDataMaps } = masterDataAndMaps
  const fixtureTypes = mapFixtureList(fixtureStrings, masterDataAndMaps)
    .map(id => masterDataMaps.fixtures.get(id)?.type)
    .filter(isTruthy)
    .filter(isUnique)
    .map(typeId => masterDataMaps.fixtureTypes.get(typeId))
    .filter(isTruthy)

  const result: Record<string, FixtureChannelState[][]> = {}
  for (const { channelStates } of fixtureTypes) {
    if (!channelStates) continue
    for (const [channelType, states] of Object.entries(channelStates)) {
      if (!states.length) continue
      ;(result[channelType] ??= []).push(states)
    }
  }
  return result
}

/**
 * Parses channel states from text with one state per line,
 * consisting of the DMX value and the name, e.g. `8 Red`.
 *
 * Invalid lines are ignored; the result is sorted by value.
 * Ranges like `8-15 Red` are accepted as well; only the start value is used.
 */
export function parseChannelStates(text: string): FixtureChannelState[] {
  const states: FixtureChannelState[] = []
  for (const line of text.split('\n')) {
    const match = /^\s*(\d+)(?:\s*-\s*\d+)?\s+(.*\S)\s*$/.exec(line)
    if (!match) continue
    const value = Number(match[1])
    if (value > 255) continue
    states.push({ value, name: match[2] })
  }
  return states.sort((a, b) => a.value - b.value)
}

/**
 * Formats channel states as text with one state per line.
 *
 * Inverse of {@link parseChannelStates}.
 */
export function formatChannelStates(states: FixtureChannelState[]): string {
  return states.map(({ value, name }) => `${value} ${name}`).join('\n')
}
