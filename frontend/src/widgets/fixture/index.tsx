import { Fixture } from '@vlight/entities'
import React, { useCallback, useState } from 'react'

import { useMasterDataMaps, useApiStateEntry } from '../../hooks/api'

import { StatelessFixtureWidget } from './widget'

export interface FixtureWidgetProps {
  fixture: Fixture
}

export const FixtureWidget = ({ fixture }: FixtureWidgetProps) => {
  const { fixtureTypes } = useMasterDataMaps()
  const fixtureType = fixtureTypes.get(fixture.type)
  const fixtureState = useApiStateEntry('fixtures', fixture.id)
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
