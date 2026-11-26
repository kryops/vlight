import {
  FixtureState,
  FixtureType,
  MasterData,
  MasterDataMaps,
  MasterDataWithMaps,
} from '@vlight/types'
import {
  logger,
  isUnique,
  average,
  isTruthy,
  preferredOrder,
} from '@vlight/utils'

import { ChannelType, FixtureMappingPrefix } from './enums'
import { parseSegmentMemberId, splitSegmentsPrefix } from './segment-ids'

/**
 * Channel mappings that are affected by the fixture's master channel by default,
 * if the fixture type does not configure `masterDependentChannels`.
 */
export const defaultMasterDependentChannels: ReadonlyArray<ChannelType> = [
  ChannelType.Red,
  ChannelType.Green,
  ChannelType.Blue,
  ChannelType.White,
  ChannelType.Amber,
  ChannelType.UV,
]

const masterDependentChannelsCache = new WeakMap<FixtureType, Set<string>>()

function getConfiguredOrDefaultMasterDependentChannels({
  mapping,
  masterDependentChannels,
}: FixtureType): ReadonlyArray<string> {
  if (masterDependentChannels) return masterDependentChannels

  // Fixtures without a master channel and without any of the default channels
  // (e.g. single dimmer channels): all channels depend on the virtual master
  if (
    !mapping.includes(ChannelType.Master) &&
    !mapping.some(channel =>
      defaultMasterDependentChannels.includes(channel as ChannelType)
    )
  ) {
    return mapping
  }

  return defaultMasterDependentChannels
}

/**
 * Returns the channel mappings of the given fixture type that depend on the fixture's master.
 *
 * See `FixtureType.masterDependentChannels`.
 */
export function getMasterDependentChannels(
  fixtureType: FixtureType
): Set<string> {
  let result = masterDependentChannelsCache.get(fixtureType)
  if (!result) {
    result = new Set(getConfiguredOrDefaultMasterDependentChannels(fixtureType))
    result.delete(ChannelType.Master)
    masterDependentChannelsCache.set(fixtureType, result)
  }
  return result
}

/**
 * Maps the following to a list of plain unique fixture IDs:
 * - fixture IDs
 * - `all:foobar` -> maps all fixtures from this original ID
 * - `type:foobar` -> maps all fixtures of type `foobar`
 * - `group:foobar` -> maps all fixtures of group `foobar`
 *
 * Segments are mapped to their fixtures:
 * - `segments:<any of the above>` -> the prefix is ignored
 * - `foobar@2` -> maps to fixture `foobar`
 *
 * To resolve segments separately, use `mapFixtureMemberList` instead.
 */
export function mapFixtureList(
  fixtureList: string[],
  { masterData, masterDataMaps }: MasterDataWithMaps
): string[] {
  return fixtureList
    .flatMap((fixture): string | string[] => {
      // `segments:foobar`
      const { segments, base } = splitSegmentsPrefix(fixture)
      if (segments) {
        return mapFixtureList([base], { masterData, masterDataMaps })
      }
      // `type:foobar`
      if (fixture.startsWith(FixtureMappingPrefix.Type)) {
        const type = fixture.slice(FixtureMappingPrefix.Type.length)
        if (!masterDataMaps.fixtureTypes.has(type)) {
          logger.warn(`Fixture type "${type}" not found, skipping mapping...`)
          return []
        }
        return masterData.fixtures.filter(f => f.type === type).map(f => f.id)
      }
      // `group:foobar`
      if (fixture.startsWith(FixtureMappingPrefix.Group)) {
        const groupId = fixture.slice(FixtureMappingPrefix.Group.length)
        const group = masterDataMaps.fixtureGroups.get(groupId)
        if (!group) {
          logger.warn(
            `Fixture group "${groupId}" not found, skipping mapping...`
          )
          return []
        }
        return group.fixtures
      }
      // `all:foobar`
      if (fixture.startsWith(FixtureMappingPrefix.All)) {
        const originalId = fixture.slice(FixtureMappingPrefix.All.length)
        const mappedFixtures = masterData.fixtures
          .filter(f => f.originalId === originalId || f.id === originalId)
          .map(f => f.id)
        if (!mappedFixtures.length) {
          logger.warn(
            `No fixtures with original ID "${fixture}" found, skipping mapping...`
          )
        }
        return mappedFixtures
      }
      // 'foobar1@2'
      if (!masterDataMaps.fixtures.has(fixture)) {
        const parsed = parseSegmentMemberId(fixture)
        if (parsed && masterDataMaps.fixtures.has(parsed.fixtureId)) {
          return parsed.fixtureId
        }
      }
      // 'foobar1'
      return fixture
    })
    .filter(isUnique)
    .filter(fixture => {
      if (!masterDataMaps.fixtures.has(fixture)) {
        logger.warn(`Fixture "${fixture}" not found, skipping mapping...`)
        return false
      }
      return true
    })
}

/**
 * Removes all values from the given fixture state that are not contained in the given mapping.
 *
 * Mutates the original object.
 */
export function cleanFixtureState(
  state: FixtureState,
  mapping: string[] | undefined
): FixtureState {
  if (!mapping) return state

  for (const channel of Object.keys(state.channels)) {
    // All fixtures have a (virtual) master channel
    if (channel === ChannelType.Master) continue
    if (!mapping.includes(channel)) delete state.channels[channel]
  }

  return state
}

/**
 * Merges the given fixture states together, removing all values that are not contained
 * in the given mapping.
 */
export function mergeFixtureStates(
  state1: FixtureState | undefined,
  state2: Partial<FixtureState>,
  mapping?: string[]
): FixtureState {
  const mergedState = {
    on: false,
    ...state1,
    ...state2,
    channels: { ...state1?.channels, ...state2.channels },
    initial: undefined, // reset initial state
  }

  return cleanFixtureState(mergedState, mapping)
}

/**
 * Maps the given fixture state into an array of channel values for the given fixture type.
 */
export function mapFixtureStateToChannels(
  type: FixtureType,
  state: FixtureState
): number[] {
  const mapping = type.mapping

  const hasMasterChannel = mapping.includes(ChannelType.Master)
  const masterChannelValue = state.channels[ChannelType.Master] ?? 255
  const masterDependentChannels = getMasterDependentChannels(type)

  return mapping.map(channelType => {
    if (!state.on) {
      return 0
    }

    if (channelType === ChannelType.Master) return masterChannelValue

    const rawValue = state.channels[channelType] ?? 0

    if (hasMasterChannel || !masterDependentChannels.has(channelType))
      return rawValue

    if (masterChannelValue === 255) return rawValue
    if (masterChannelValue === 0 || rawValue === 0) return 0

    return Math.round((masterChannelValue / 255) * rawValue)
  })
}

export interface CommonFixtureStateEntry {
  state: FixtureState
  mapping: string[]
}

/**
 * Creates a common fixture state of the given fixture states and their channel mappings.
 * - the result contains values for all channels contained in any of the fixture state
 * - averages the values of all fixture states
 * - the result is on if any of the given fixture states is
 */
export function getCommonFixtureState(
  entries: CommonFixtureStateEntry[]
): FixtureState {
  const commonFixtureState: FixtureState = {
    on: entries.some(entry => entry.state.on),
    channels: {},
  }

  if (entries.length === 0) return commonFixtureState

  const allMappings = new Set(entries.flatMap(entry => entry.mapping))

  for (const channel of allMappings) {
    const values = entries
      .map(entry => entry.state.channels[channel])
      .filter(value => value !== undefined)

    if (values.length) {
      commonFixtureState.channels[channel] = average(values)
    }
  }

  return commonFixtureState
}

/**
 * Get the common mapping for the given fixture strings.
 * - Prefixed fixture groupings are resolved
 * - The common mapping contains the channels types of all contained fixture types
 * - If no physical master channel is contained, a virtual one is added
 * - The result is put into the preferred order to put the master and the channels first
 */
export function getCommonFixtureMapping(
  fixtureStrings: string[],
  masterDataAndMaps: { masterData: MasterData; masterDataMaps: MasterDataMaps }
): string[] {
  const fixtureIds = mapFixtureList(fixtureStrings, masterDataAndMaps)

  const { masterDataMaps } = masterDataAndMaps

  const fixtures = fixtureIds
    .map(id => masterDataMaps.fixtures.get(id))
    .filter(isTruthy)
  const commonFixtureTypes = fixtures
    .map(({ type }) => masterDataMaps.fixtureTypes.get(type))
    .filter(isTruthy)
    .filter(isUnique)
  const mapping = commonFixtureTypes
    .flatMap(({ mapping }) => mapping)
    .filter(isUnique)

  // Fixtures without a master channel get a virtual one
  if (!mapping.includes(ChannelType.Master)) mapping.unshift(ChannelType.Master)

  return preferredOrder(mapping, [
    ChannelType.Master,
    ChannelType.Red,
    ChannelType.Green,
    ChannelType.Blue,
    ChannelType.White,
  ])
}
