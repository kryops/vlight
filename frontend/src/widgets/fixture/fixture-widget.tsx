import React from 'react'
import { Fixture, FixtureType } from '@vlight/types'
import { mergeFixtureStates } from '@vlight/controls'

import { useMasterDataMaps, useApiStateEntry } from '../../hooks/api'
import { setFixtureState } from '../../api'
import { Icon } from '../../ui/icons/icon'
import { iconConfig } from '../../ui/icons'
import { openEntityEditorForId } from '../../pages/config/entities/editors'

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
      titleSide={
        <Icon
          icon={iconConfig}
          onClick={() =>
            openEntityEditorForId('fixtures', fixture.originalId ?? fixture.id)
          }
          shade={1}
          hoverable
          inline
        />
      }
      fixtureState={fixtureState}
      mapping={fixtureType.mapping}
      onChange={partialState =>
        setFixtureState(
          fixture.id,
          mergeFixtureStates(fixtureState, partialState)
        )
      }
    />
  )
}
