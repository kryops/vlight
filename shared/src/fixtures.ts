import { FixtureState, MasterData, MasterDataMaps } from '@vlight/entities'

import { logger } from './log'
import { FixtureMappingPrefix } from './enums'
import { isUnique } from './validation'

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
          .filter(f => f.originalId === originalId)
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
