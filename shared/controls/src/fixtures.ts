import {
  FixtureState,
  FixtureType,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { logger, isUnique, average, isTruthy } from '@vlight/utils'

import { ChannelMapping, FixtureMappingPrefix } from './enums'

/**
 * Maps the following to a list of plain unique fixture IDs:
 * - fixture IDs
 * - `all:foobar` -> maps all fixtures from this original ID
 * - `type:foobar` -> maps all fixtures of type `foobar`
 * - `group:foobar` -> maps all fixtures of group `foobar`
 */
export function mapFixtureList(
  fixtureList: string[],
  {
    masterData,
    masterDataMaps,
  }: { masterData: MasterData; masterDataMaps: MasterDataMaps }
): string[] {
  return fixtureList
    .flatMap(fixture => {
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
 * Mutates the original object
 */
export function cleanFixtureState(
  state: FixtureState,
  mapping: string[] | undefined
): FixtureState {
  if (!mapping) return state

  for (const channel of Object.keys(state.channels)) {
    if (!mapping.includes(channel)) delete state.channels[channel]
  }

  return state
}

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

export function mapFixtureStateToChannels(
  type: FixtureType,
  state: FixtureState
): number[] {
  const mapping = type.mapping

  const hasMasterChannel = mapping.includes(ChannelMapping.Master)
  const masterChannelValue = state.channels[ChannelMapping.Master] ?? 255

  return mapping.map(channelType => {
    if (!state.on) {
      return 0
    }

    if (channelType === ChannelMapping.Master) masterChannelValue

    const rawValue = state.channels[channelType] ?? 0

    if (hasMasterChannel) return rawValue

    return Math.round((rawValue * masterChannelValue) / 255)
  })
}

export interface CommonFixtureStateEntry {
  state: FixtureState
  mapping: string[]
}

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
  return commonFixtureTypes.flatMap(({ mapping }) => mapping).filter(isUnique)
}
