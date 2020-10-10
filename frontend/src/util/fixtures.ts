import { Fixture, FixtureState, FixtureType, MasterData } from '@vlight/types'
import { ChannelMapping } from '@vlight/controls'

import { masterDataMaps } from '../api/masterdata'

const rgbwMapping = [
  ChannelMapping.red,
  ChannelMapping.green,
  ChannelMapping.blue,
  ChannelMapping.white,
]

const minOpacity = 0.25

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

export function getFixtureStateColor(
  fixtureState: FixtureState
): string | undefined {
  if (!fixtureState.on) return undefined

  const masterValue = fixtureState.channels[ChannelMapping.master] ?? 255
  const values = rgbwMapping.map(mapping => fixtureState.channels[mapping])

  return getColor(masterValue, values)
}

export function getEffectiveFixtureColor(
  fixture: Fixture,
  fixtureType: FixtureType | undefined,
  universe: number[]
): string | undefined {
  if (!fixtureType) return undefined

  const getMappingValue = (mapping: ChannelMapping) => {
    const offset = fixtureType.mapping.indexOf(mapping)
    if (offset === -1) return undefined
    return universe[fixture.channel - 1 + offset]
  }

  const hasMaster = fixtureType.mapping.includes(ChannelMapping.master)
  const masterValue = hasMaster ? getMappingValue(ChannelMapping.master)! : 255
  const values = rgbwMapping.map(getMappingValue)

  return getColor(masterValue, values)
}

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
