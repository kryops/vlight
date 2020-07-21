import { Fixture } from '@vlight/entities'

import { arrayRange, logger } from '../../../util/shared'
import { isUnique } from '../../../util/shared'
import { masterData, masterDataMaps } from '../data'
import { registerMasterDataEntity } from '../registry'

function replaceIndex<T extends string | undefined>(
  value: T,
  index: number,
  isName = false
): T {
  if (!value) return value
  if (!value.includes('#')) {
    return (isName ? `${value} (${index})` : `${value}_${index}`) as T
  }
  return value.replace(/#/g, String(index)) as T
}

function computeChannel(type: string, baseChannel: number, index: number) {
  const fixtureType = masterDataMaps.fixtureTypes.get(type)
  const numChannels = fixtureType ? fixtureType.mapping.length : 1
  return baseChannel + (index - 1) * numChannels
}

function processFixture(fixture: Fixture): Fixture | Fixture[] {
  const { id, type, channel, name, count } = fixture

  const fixtureType = masterDataMaps.fixtureTypes.get(type)
  if (!fixtureType) {
    logger.warn(
      `No fixtureType ${type} found for fixture ${id} / ${name}, skipping...`
    )
    return []
  }

  if (!count || count === 1) {
    return fixture
  }

  return arrayRange(1, count, index => ({
    id: replaceIndex(id, index),
    originalId: id,
    name: replaceIndex(name, index, true),
    type,
    channel: computeChannel(type, channel, index),
  }))
}

function preprocessor(fixtures: Fixture[]): Fixture[] {
  return fixtures.flatMap(processFixture)
}

// only for unit test
export const processFixtures = preprocessor

const typeMarker = 'type:'
const groupMarker = 'group:'
const countMarker = 'all:'

/**
 * Maps the following to a list of plain unique fixture IDs:
 * - fixture IDs
 * - `all:foobar` -> maps all fixtures from this original ID
 * - `type:foobar` -> maps all fixtures of type `foobar`
 * - `group:foobar` -> maps all fixtures of group `foobar`
 */
export function mapFixtureList(fixtureList: string[]): string[] {
  const allFixtures = masterData.fixtures

  return fixtureList
    .flatMap(fixture => {
      // `type:foobar`
      if (fixture.startsWith(typeMarker)) {
        const type = fixture.slice(typeMarker.length)
        if (!masterDataMaps.fixtureTypes.has(type)) {
          logger.warn(`Fixture type "${type}" not found, skipping mapping...`)
          return []
        }
        return allFixtures.filter(f => f.type === type).map(f => f.id)
      }
      // `group:foobar`
      if (fixture.startsWith(groupMarker)) {
        const groupId = fixture.slice(groupMarker.length)
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
      if (fixture.startsWith(countMarker)) {
        const originalId = fixture.slice(countMarker.length)
        const mappedFixtures = allFixtures
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

export function init(): void {
  registerMasterDataEntity('fixtures', {
    preprocessor,
    dependencies: ['fixtureTypes'],
  })
}
