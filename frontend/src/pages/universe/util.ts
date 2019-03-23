import { MasterData } from '@vlight/entities'

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
