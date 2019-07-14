import { Fixture } from '@vlight/entities'
import React, { useCallback, useState } from 'react'

import { useAppState, useMasterDataMaps } from '../../hooks/api'

import { StatelessFixtureWidget } from './widget'

export interface Props {
  fixture: Fixture
}

export const FixtureWidget: React.SFC<Props> = ({ fixture }) => {
  const appState = useAppState()
  const { fixtureTypes } = useMasterDataMaps()
  const fixtureType = fixtureTypes.get(fixture.type)
  const fixtureState = appState.fixtures[fixture.id]
  const [colorPicker, setColorPicker] = useState(true)
  const toggleColorPicker = useCallback(() => setColorPicker(prev => !prev), [])

  if (!fixtureState || !fixtureType) {
    return null
  }

  return (
    <StatelessFixtureWidget
      fixture={fixture}
      fixtureType={fixtureType}
      fixtureState={fixtureState}
      colorPicker={colorPicker}
      toggleColorPicker={toggleColorPicker}
    />
  )
}
