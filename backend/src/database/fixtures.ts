import { Fixture } from '@vlight/entities'

import { arrayRange } from '../util/array'

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
  if (!fixture.count || fixture.count === 1) {
    return fixture
  }

  const { id, type, channel, name } = fixture

  return arrayRange(1, fixture.count, index => ({
    id: replaceIndex(id, index),
    name: replaceIndex(name, index),
    type,
    channel: computeChannel(type, channel, index),
  }))
}

export function processFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.map(processFixture).flat()
}
