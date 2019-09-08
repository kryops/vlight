import { Fixture } from '@vlight/entities'

import { arrayRange } from '../../util/array'
import { logWarn } from '../../util/log'
import { isUnique } from '../../util/validation'

import { fixtureTypes, masterData, fixtureGroups, fixtures } from '..'

function replaceIndex<T extends string | undefined>(
  value: T,
  index: number
): T {
  if (!value) return value
  return value.replace(/#/g, String(index)) as T
}

function computeChannel(type: string, baseChannel: number, index: number) {
  const fixtureType = fixtureTypes.get(type)
  const numChannels = fixtureType ? fixtureType.mapping.length : 1
  return baseChannel + (index - 1) * numChannels
}

function processFixture(fixture: Fixture): Fixture | Fixture[] {
  const { id, type, channel, name, count } = fixture

  const fixtureType = fixtureTypes.get(type)
  if (!fixtureType) {
    logWarn(
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
    name: replaceIndex(name, index),
    type,
    channel: computeChannel(type, channel, index),
  }))
}

export function processFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.flatMap(processFixture)
}

const typeMarker = 'type:'
const groupMarker = 'group:'
const countMarker = '#'

/**
 * Maps the following to a list of plain unique fixture IDs:
 * - fixture IDs
 * - fixture IDs containing # -> maps all fixtures with this ID originally configured
 * - `type:foobar` -> maps all fixtures of type `foobar`
 * - `group:foobar` -> maps all fixtures of group `foobar`
 */
export function mapFixtureList(fixtureList: string[]) {
  const allFixtures = masterData.fixtures

  return fixtureList
    .flatMap(fixture => {
      // `type:foobar`
      if (fixture.startsWith(typeMarker)) {
        const type = fixture.slice(typeMarker.length)
        if (!fixtureTypes.has(type)) {
          logWarn(`Fixture type "${type}" not found, skipping mapping...`)
          return []
        }
        return allFixtures.filter(f => f.type === type).map(f => f.id)
      }
      // `group:foobar`
      if (fixture.startsWith(groupMarker)) {
        const groupId = fixture.slice(groupMarker.length)
        const group = fixtureGroups.get(groupId)
        if (!group) {
          logWarn(`Fixture group "${groupId}" not found, skipping mapping...`)
          return []
        }
        return group.fixtures
      }
      // `foobar#`
      if (fixture.includes(countMarker)) {
        const mappedFixtures = allFixtures
          .filter(f => f.originalId === fixture)
          .map(f => f.id)
        if (!mappedFixtures.length) {
          logWarn(`No fixtures with ID "${fixture}" found, skipping mapping...`)
        }
        return mappedFixtures
      }
      // 'foobar1'
      return fixture
    })
    .filter(isUnique)
    .filter(fixture => {
      if (!fixtures.has(fixture)) {
        logWarn(`Fixture "${fixture}" not found, skipping mapping...`)
        return false
      }
      return true
    })
}
