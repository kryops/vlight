import { Fixture, IdType } from '@vlight/types'
import { arrayRange, logger } from '@vlight/utils'

import { masterDataMaps } from '../data'
import { registerMasterDataEntity } from '../registry'

/**
 * Replaces the `#` character with the fixture index.
 * If no placeholder is container, the index is appended at the end.
 *
 * Supports both names and IDs.
 */
function replaceIndexPlaceholder<T extends string | undefined>(
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

/** Computes the DMX channel the fixture with the given index. */
function computeChannel({
  type,
  baseChannel,
  channelOffset,
  index,
}: {
  type: IdType
  baseChannel: number
  channelOffset: number | undefined
  index: number
}) {
  const fixtureType = masterDataMaps.fixtureTypes.get(type)
  const numChannels =
    (fixtureType ? fixtureType.mapping.length : 1) + (channelOffset ?? 0)
  return baseChannel + (index - 1) * numChannels
}

/**
 * Processes a fixture definition:
 * - Generates multiple fixtures if {@link Fixture.count} is set
 * - Replaces the `#` character with the fixture index
 */
function processFixture(fixture: Fixture): Fixture | Fixture[] {
  const { id, type, channel, name } = fixture
  const { count, xOffset, yOffset, channelOffset, ...resetToKeep } = fixture

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
    id: replaceIndexPlaceholder(id, index),
    originalId: id,
    name: replaceIndexPlaceholder(name, index, true),
    type,
    channel: computeChannel({
      type,
      baseChannel: channel,
      channelOffset,
      index,
    }),
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
