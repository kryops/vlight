import { MasterData, Fixture, FixtureType } from '@vlight/entities'

import { ChannelMapping } from '../../api/enums'
import { masterDataMaps } from '../../api/masterdata'

export function getFixtureAtChannel(masterData: MasterData, channel: number) {
  return masterData.fixtures.find(fixture => {
    if (fixture.channel === channel) return true
    if (fixture.channel > channel) return false
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
    if (!fixtureType) return false
    const maxChannel = fixture.channel + fixtureType.mapping.length - 1
    return maxChannel >= channel
  })
}

export function getEffectiveFixtureColor(
  fixture: Fixture,
  fixtureType: FixtureType,
  universe: number[]
) {
  const getMappingValue = (mapping: ChannelMapping) => {
    const offset = fixtureType.mapping.indexOf(mapping)
    if (offset === -1) return 0
    return universe[fixture.channel - 1 + offset]
  }

  const hasMaster = fixtureType.mapping.includes(ChannelMapping.master)
  const masterValue = hasMaster ? getMappingValue(ChannelMapping.master) : 255

  const values = [
    ChannelMapping.red,
    ChannelMapping.green,
    ChannelMapping.blue,
  ].map(getMappingValue)

  if (values.every(x => x === 0)) return undefined
  const [r, g, b] = values
  const opacity = 0.3 + (masterValue / 255) * 0.7
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
