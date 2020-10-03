import { FixtureGroup } from '@vlight/entities'
import { mapFixtureList } from '@vlight/shared'

import { masterData, masterDataMaps } from '../data'
import { registerMasterDataEntity } from '../registry'

function processFixtureGroup({
  fixtures,
  ...rest
}: FixtureGroup): FixtureGroup {
  return {
    ...rest,
    fixtures: mapFixtureList(fixtures, { masterData, masterDataMaps }),
  }
}

function preprocessor(groups: FixtureGroup[]): FixtureGroup[] {
  return groups.map(processFixtureGroup)
}

// only for unit test
export const processFixtureGroups = preprocessor

export function init(): void {
  registerMasterDataEntity('fixtureGroups', {
    preprocessor,
    dependencies: ['fixtures', 'fixtureTypes'],
  })
}
