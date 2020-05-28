import { FixtureGroup } from '@vlight/entities'

import { registerMasterDataEntity } from '../registry'

import { mapFixtureList } from './fixtures'

function processFixtureGroup({
  fixtures,
  ...rest
}: FixtureGroup): FixtureGroup {
  return {
    ...rest,
    fixtures: mapFixtureList(fixtures),
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
