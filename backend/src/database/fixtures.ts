import { Fixture } from '@vlight/entities'

import { arrayRange } from '../util/array'
import { logWarn } from '../util/log'

import { fixtureTypes } from '.'

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
    name: replaceIndex(name, index),
    type,
    channel: computeChannel(type, channel, index),
  }))
}

export function processFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.map(processFixture).flat()
}
