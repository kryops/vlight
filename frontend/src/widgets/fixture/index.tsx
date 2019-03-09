import { Fixture } from '@vlight/entities'
import React from 'react'

import { fixtureTypes } from '../../api/masterdata'
import { useAppState } from '../../hooks/api'

import { StatelessFixtureWidget } from './widget'

export interface Props {
  fixture: Fixture
}

export const FixtureWidget: React.SFC<Props> = ({ fixture }) => {
  const appState = useAppState()
  const fixtureType = fixtureTypes.get(fixture.type)
  const fixtureState = appState.fixtures[fixture.id]
  if (!fixtureState || !fixtureType) {
    return null
  }

  return (
    <StatelessFixtureWidget
      fixture={fixture}
      fixtureType={fixtureType}
      fixtureState={fixtureState}
    />
  )
}
