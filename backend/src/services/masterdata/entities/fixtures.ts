import { Fixture } from '@vlight/entities'
import { arrayRange, logger } from '@vlight/shared'

import { masterDataMaps } from '../data'
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
  const { id, type, channel, name } = fixture
  const { count, xOffset, yOffset, ...resetToKeep } = fixture

  const fixtureType = masterDataMaps.fixtureTypes.get(type)
  if (!fixtureType) {
    logger.warn(
      `No fixtureType ${type} found for fixture ${id} / ${name}, skipping...`
    )
    return []
  }

  if (!count || count <= 1) {
    return fixture
  }

  return arrayRange(1, count, index => ({
    ...resetToKeep,
    id: replaceIndex(id, index),
    originalId: id,
    name: replaceIndex(name, index, true),
    type,
    channel: computeChannel(type, channel, index),
    x:
      fixture.x !== undefined
        ? fixture.x + (index - 1) * (fixture.xOffset ?? 8)
        : undefined,
    y:
      fixture.y !== undefined
        ? fixture.y + (index - 1) * (fixture.yOffset ?? 0)
        : undefined,
  }))
}

function preprocessor(fixtures: Fixture[]): Fixture[] {
  return fixtures.flatMap(processFixture)
}

// only for unit test
export const processFixtures = preprocessor

export function init(): void {
  registerMasterDataEntity('fixtures', {
    preprocessor,
    dependencies: ['fixtureTypes'],
  })
}
