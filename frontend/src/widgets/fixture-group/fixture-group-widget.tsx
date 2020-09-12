import { FixtureGroup } from '@vlight/entities'
import React from 'react'

import { changeFixtureGroupState } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { FixtureStateWidget } from '../fixture/fixture-state-widget'

export interface FixtureGroupWidgetProps {
  group: FixtureGroup
}

export const FixtureGroupWidget = ({ group }: FixtureGroupWidgetProps) => {
  const groupState = useApiStateEntry('fixtureGroups', group.id)
  const groupMapping = useCommonFixtureMapping(group.fixtures)

  if (!groupState) {
    return null
  }

  return (
    <FixtureStateWidget
      title={`${group.name ?? group.id} (${group.fixtures.length})`}
      fixtureState={groupState}
      mapping={groupMapping}
      onChange={partialState =>
        changeFixtureGroupState(group.id, groupState, partialState)
      }
    />
  )
}
