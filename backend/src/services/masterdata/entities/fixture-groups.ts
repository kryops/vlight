import { FixtureGroup } from '@vlight/types'
import { mapFixtureList } from '@vlight/controls'

import { masterData, masterDataMaps } from '../data'
import { registerMasterDataEntity } from '../registry'

/**
 * Resolves the group's members to an actual fixture list.
 */
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
