import {
  FixtureState,
  FixtureType,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { logger, isUnique } from '@vlight/utils'

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
      if (fixture.startsWith(FixtureMappingPrefix.type)) {
        const type = fixture.slice(FixtureMappingPrefix.type.length)
        if (!masterDataMaps.fixtureTypes.has(type)) {
          logger.warn(`Fixture type "${type}" not found, skipping mapping...`)
          return []
        }
        return masterData.fixtures.filter(f => f.type === type).map(f => f.id)
      }
      // `group:foobar`
      if (fixture.startsWith(FixtureMappingPrefix.group)) {
        const groupId = fixture.slice(FixtureMappingPrefix.group.length)
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
      if (fixture.startsWith(FixtureMappingPrefix.all)) {
        const originalId = fixture.slice(FixtureMappingPrefix.all.length)
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

export function mergeFixtureStates(
  state1: FixtureState | undefined,
  state2: Partial<FixtureState>
): FixtureState {
  return {
    on: false,
    ...state1,
    ...state2,
    channels: { ...state1?.channels, ...state2.channels },
    initial: undefined, // reset initial state
  }
}

export function mapFixtureStateToChannels(
  type: FixtureType,
  state: FixtureState
): number[] {
  const mapping = type.mapping

  const hasMasterChannel = mapping.includes(ChannelMapping.master)
  const masterChannelValue = state.channels[ChannelMapping.master] ?? 255

  return mapping.map(channelType => {
    if (!state.on) {
      return 0
    }

    if (channelType === ChannelMapping.master) masterChannelValue

    const rawValue = state.channels[channelType] ?? 0

    if (hasMasterChannel) return rawValue

    return Math.round((rawValue * masterChannelValue) / 255)
  })
}
