import { FixtureGroup } from '@vlight/entities'

import { isUnique } from '../../util/validation'

import { masterData } from '..'

const typeMarker = 'type:'
const countMarker = '#'

function processFixtureGroup(group: FixtureGroup): FixtureGroup {
  const allFixtures = masterData.fixtures

  const fixtures = group.fixtures
    .flatMap(fixture => {
      if (fixture.startsWith(typeMarker)) {
        const type = fixture.slice(typeMarker.length)
        return allFixtures.filter(f => f.type === type).map(f => f.id)
      }
      if (fixture.includes(countMarker)) {
        return allFixtures.filter(f => f.originalId === fixture).map(f => f.id)
      }
      return fixture
    })
    .filter(isUnique)

  return {
    ...group,
    fixtures,
  }
}

export function processFixtureGroups(groups: FixtureGroup[]): FixtureGroup[] {
  return groups.map(processFixtureGroup)
}
