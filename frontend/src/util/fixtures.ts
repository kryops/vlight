import {
  Fixture,
  FixtureState,
  FixtureType,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { ChannelType } from '@vlight/controls'
import { createRangeArray, createZeroArray } from '@vlight/utils'

import { getMasterDataMaps } from '../api/masterdata'

type RgbColor = [r: number, g: number, b: number]

/**
 * Colored light sources and the RGB color they contribute to the preview.
 * They are mixed additively.
 */
const coloredEmitters: Array<[ChannelType, RgbColor]> = [
  [ChannelType.Red, [255, 0, 0]],
  [ChannelType.Green, [0, 255, 0]],
  [ChannelType.Blue, [0, 0, 255]],
  [ChannelType.Amber, [255, 150, 0]],
  [ChannelType.UV, [130, 0, 255]],
]

const previewMapping = [
  ...coloredEmitters.map(([channelType]) => channelType),
  ChannelType.White,
]

const minOpacity = 0.1

function applyMinOpacity(masterValue: number) {
  return minOpacity + (masterValue / 255) * (1 - minOpacity)
}

function getColor(
  masterValue: number,
  getValue: (channelType: ChannelType) => number | undefined
): string | undefined {
  if (masterValue === 0) return undefined

  const values = new Map(
    previewMapping.map(channelType => [channelType, getValue(channelType)])
  )

  // no mapping - fall back to white
  if ([...values.values()].every(value => value === undefined)) {
    return `rgba(255, 255, 255, ${applyMinOpacity(masterValue)})`
  }

  const w = values.get(ChannelType.White)

  // Mix colored emitters additively
  const rgb: RgbColor = [0, 0, 0]
  let highestColorValue = 0
  for (const [channelType, emitterColor] of coloredEmitters) {
    const value = values.get(channelType)
    if (!value) continue
    highestColorValue = Math.max(highestColorValue, value)
    emitterColor.forEach(
      (component, index) => (rgb[index] += (component * value) / 255)
    )
  }

  if (highestColorValue === 0) {
    if (w) {
      return `rgba(255, 255, 255, ${applyMinOpacity(masterValue * (w / 255))})`
    } else {
      return undefined
    }
  }

  // Normalize color and shift intensity to opacity
  const highestComponent = Math.max(...rgb)
  rgb.forEach((value, index) => (rgb[index] = (value * 255) / highestComponent))

  // Merge in white channel

  if (w) {
    const whiteFactor =
      highestColorValue >= w
        ? (w / highestColorValue) * 0.75
        : 1 - (highestColorValue / w) * 0.25
    rgb.forEach(
      (value, index) => (rgb[index] = value + (255 - value) * whiteFactor)
    )
  }

  const [r, g, b] = rgb.map(Math.round)
  const opacity = applyMinOpacity(
    (masterValue * Math.max(highestColorValue, w ?? 0)) / 255
  )
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Maps a fixture state to a CSS color string.
 */
export function getFixtureStateColor(
  fixtureState: FixtureState
): string | undefined {
  if (!fixtureState.on) return undefined

  const masterValue = fixtureState.channels[ChannelType.Master] ?? 255
  return getColor(
    masterValue,
    channelType => fixtureState.channels[channelType]
  )
}

/**
 * Maps a DMX universe state to the effective color of a fixture.
 */
export function getEffectiveFixtureColor(
  fixture: Pick<Fixture, 'channel'>,
  fixtureType: FixtureType | undefined,
  universe: number[]
): string | undefined {
  if (!fixtureType) return undefined

  const getMappingValue = (channelType: ChannelType) => {
    const offset = fixtureType.mapping.indexOf(channelType)
    if (offset === -1) return undefined
    return universe[fixture.channel - 1 + offset]
  }

  const hasMaster = fixtureType.mapping.includes(ChannelType.Master)
  const masterValue = hasMaster ? getMappingValue(ChannelType.Master)! : 255
  return getColor(masterValue, getMappingValue)
}

/**
 * Returns the fixture at the given DMX channel.
 */
export function getFixtureAtChannel(
  masterData: MasterData,
  channel: number
): Fixture | undefined {
  return masterData.fixtures.find(fixture => {
    if (fixture.channel === channel) return true
    if (fixture.channel > channel) return false
    const fixtureType = getMasterDataMaps().fixtureTypes.get(fixture.type)
    if (!fixtureType) return false
    const maxChannel = fixture.channel + fixtureType.mapping.length - 1
    return maxChannel >= channel
  })
}

/**
 * Returns all DMX channels occupied by a fixture
 * (or raw fixture definition)
 */
export function getOccupiedFixtureChannels(
  fixture: Fixture,
  masterDataMaps: MasterDataMaps,
  { isRaw = false }: { isRaw?: boolean } = {}
): number[] {
  const channelsPerFixture =
    masterDataMaps.fixtureTypes.get(fixture.type)?.mapping.length ?? 1
  const channelOffset = fixture.channelOffset ?? 0

  const count = Math.floor(isRaw ? (fixture.count ?? 1) : 1)

  return createZeroArray(count).flatMap((_, index) => {
    const startChannel =
      fixture.channel + index * (channelsPerFixture + channelOffset)

    return createRangeArray(startChannel, startChannel + channelsPerFixture - 1)
  })
}

/**
 * Returns the set of DMX channels occupied by all fixtures
 * except the given raw fixture definition (and the fixtures created from it).
 */
function getChannelsOccupiedByOtherFixtures(
  rawFixtureId: string,
  masterData: MasterData,
  masterDataMaps: MasterDataMaps
): Set<number> {
  return new Set(
    masterData.fixtures
      .filter(
        fixture =>
          !rawFixtureId ||
          (fixture.id !== rawFixtureId && fixture.originalId !== rawFixtureId)
      )
      .flatMap(fixture => getOccupiedFixtureChannels(fixture, masterDataMaps))
  )
}

/**
 * Returns all DMX channels of a raw fixture definition
 * that are also occupied by other fixtures.
 */
export function getOverlappingFixtureChannels(
  rawFixture: Fixture,
  masterData: MasterData,
  masterDataMaps: MasterDataMaps
): number[] {
  const otherChannels = getChannelsOccupiedByOtherFixtures(
    rawFixture.id,
    masterData,
    masterDataMaps
  )
  return getOccupiedFixtureChannels(rawFixture, masterDataMaps, {
    isRaw: true,
  }).filter(channel => otherChannels.has(channel))
}

/**
 * Returns the first start channel at which the raw fixture definition
 * fits into the universe without overlapping other fixtures.
 *
 * Returns `undefined` if there is no such channel.
 */
export function findFreeFixtureChannel(
  rawFixture: Fixture,
  masterData: MasterData,
  masterDataMaps: MasterDataMaps,
  universeSize = 512
): number | undefined {
  const otherChannels = getChannelsOccupiedByOtherFixtures(
    rawFixture.id,
    masterData,
    masterDataMaps
  )

  for (let channel = 1; channel <= universeSize; channel++) {
    if (otherChannels.has(channel)) continue
    const occupiedChannels = getOccupiedFixtureChannels(
      { ...rawFixture, channel },
      masterDataMaps,
      { isRaw: true }
    )
    if (
      occupiedChannels.every(it => it <= universeSize && !otherChannels.has(it))
    ) {
      return channel
    }
  }

  return undefined
}

/**
 * Formats a sorted list of channels into a compact string,
 * e.g. `1 - 4, 7, 9 - 10`.
 */
export function formatChannelList(channels: number[]): string {
  const segments: string[] = []
  let segmentStart: number | undefined
  let previous: number | undefined

  const closeSegment = () => {
    if (segmentStart === undefined || previous === undefined) return
    segments.push(
      previous === segmentStart
        ? String(segmentStart)
        : `${segmentStart} - ${previous}`
    )
  }

  for (const channel of channels) {
    if (previous === undefined || channel !== previous + 1) {
      closeSegment()
      segmentStart = channel
    }
    previous = channel
  }
  closeSegment()

  return segments.join(', ')
}
