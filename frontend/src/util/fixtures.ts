import {
  Fixture,
  FixtureState,
  FixtureType,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { ChannelType } from '@vlight/controls'
import { createRangeArray } from '@vlight/utils'

import { masterDataMaps } from '../api/masterdata'

const rgbwMapping = [
  ChannelType.Red,
  ChannelType.Green,
  ChannelType.Blue,
  ChannelType.White,
]

const minOpacity = 0.1

function applyMinOpacity(masterValue: number) {
  return minOpacity + (masterValue / 255) * (1 - minOpacity)
}

function getColor(
  masterValue: number,
  values: Array<number | undefined>
): string | undefined {
  if (masterValue === 0) return undefined

  // no mapping - fall back to white
  if (values.every(value => value === undefined)) {
    return `rgba(255, 255, 255, ${applyMinOpacity(masterValue)})`
  }

  // Normalize values and shift difference to opacity
  const rgb = values.slice(0, 3)
  const w = values[3]

  const highestRgbValue = Math.max(
    ...(rgb.filter(value => value !== undefined) as number[])
  )

  if (highestRgbValue === 0) {
    if (w) {
      return `rgba(255, 255, 255, ${applyMinOpacity(masterValue * (w / 255))})`
    } else {
      return undefined
    }
  }

  if (highestRgbValue > 0 && highestRgbValue < 255) {
    rgb.forEach(
      (value, index) => (rgb[index] = ((value ?? 0) * 255) / highestRgbValue)
    )
  }

  // Merge in white channel

  if (w) {
    const whiteFactor =
      highestRgbValue >= w
        ? (w / highestRgbValue) * 0.75
        : 1 - (highestRgbValue / w) * 0.25
    rgb.forEach(
      (value, index) =>
        (rgb[index] = (value ?? 0) + (255 - (value ?? 0)) * whiteFactor)
    )
  }

  const [r, g, b] = rgb
  const opacity = applyMinOpacity(
    (masterValue * Math.max(highestRgbValue, w ?? 0)) / 255
  )
  return `rgba(${r ?? 0}, ${g ?? 0}, ${b ?? 0}, ${opacity})`
}

/**
 * Maps a fixture state to a CSS color string.
 */
export function getFixtureStateColor(
  fixtureState: FixtureState
): string | undefined {
  if (!fixtureState.on) return undefined

  const masterValue = fixtureState.channels[ChannelType.Master] ?? 255
  const values = rgbwMapping.map(mapping => fixtureState.channels[mapping])

  return getColor(masterValue, values)
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
  const values = rgbwMapping.map(getMappingValue)

  return getColor(masterValue, values)
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
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
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

  const count = Math.floor(isRaw ? fixture.count ?? 1 : 1)

  return new Array(count).fill(0).flatMap((_, index) => {
    const startChannel =
      fixture.channel + index * (channelsPerFixture + channelOffset)

    return createRangeArray(startChannel, startChannel + channelsPerFixture - 1)
  })
}
