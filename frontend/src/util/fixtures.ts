import {
  Fixture,
  FixtureState,
  FixtureType,
  MasterData,
} from '@vlight/entities'

import { ChannelMapping } from '../../../shared/src'
import { masterDataMaps } from '../api/masterdata'

const rgbw = [
  ChannelMapping.red,
  ChannelMapping.green,
  ChannelMapping.blue,
  ChannelMapping.white,
]

function getColor(
  masterValue: number,
  values: Array<number | undefined>
): string | undefined {
  if (masterValue === 0) return undefined
  if (values.every(value => value === 0)) return undefined

  // no mapping - fall back to white
  if (values.every(value => value === undefined)) {
    const opacity = masterValue / 255
    return `rgba(255, 255, 255, ${opacity})`
  }

  // Normalize values and shift difference to opacity
  const highestValue = Math.max(
    ...(values.filter(value => value !== undefined) as number[])
  )
  if (highestValue < 255) {
    values.forEach(
      (value, index) => (values[index] = ((value ?? 0) * 255) / highestValue)
    )
  }

  // Merge in white channel
  const w = values[3]
  if (w) {
    const whiteFactor = (w / 255) * 0.75
    values.forEach(
      (value, index) =>
        (values[index] = (value ?? 0) + (255 - (value ?? 0)) * whiteFactor)
    )
  }

  const [r, g, b] = values
  const opacity = 0.25 + (((masterValue / 255) * highestValue) / 255) * 0.75
  return `rgba(${r ?? 0}, ${g ?? 0}, ${b ?? 0}, ${opacity})`
}

export function getFixtureStateColor(
  fixtureState: FixtureState
): string | undefined {
  if (!fixtureState.on) return undefined

  const masterValue = fixtureState.channels[ChannelMapping.master] ?? 255
  const values = rgbw.map(mapping => fixtureState.channels[mapping])

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
  const values = rgbw.map(getMappingValue)

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
