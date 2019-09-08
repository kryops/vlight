import { FixtureGroup } from '@vlight/entities'

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

export function processFixtureGroups(groups: FixtureGroup[]): FixtureGroup[] {
  return groups.map(processFixtureGroup)
}
