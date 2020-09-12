import { Fixture, FixtureType } from '@vlight/entities'
import React from 'react'

import { changeFixtureState } from '../../api'
import { useMasterDataMaps, useApiStateEntry } from '../../hooks/api'

import { FixtureStateWidget } from './fixture-state-widget'

export function getFixtureName(
  fixture: Fixture,
  fixtureType: FixtureType
): string {
  if (fixture.name) {
    return `${fixture.channel} ${fixture.name}`
  }
  return `${fixture.channel} ${fixtureType.name}`
}

export interface FixtureWidgetProps {
  fixture: Fixture
}

export const FixtureWidget = ({ fixture }: FixtureWidgetProps) => {
  const { fixtureTypes } = useMasterDataMaps()
  const fixtureType = fixtureTypes.get(fixture.type)
  const fixtureState = useApiStateEntry('fixtures', fixture.id)

  if (!fixtureState || !fixtureType) {
    return null
  }

  return (
    <FixtureStateWidget
      title={getFixtureName(fixture, fixtureType)}
      fixtureState={fixtureState}
      mapping={fixtureType.mapping}
      onChange={partialState =>
        changeFixtureState(fixture.id, fixtureState, partialState)
      }
    />
  )
}
