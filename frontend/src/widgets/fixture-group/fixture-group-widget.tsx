import { FixtureGroup } from '@vlight/entities'
import React from 'react'

import { setFixtureGroupState } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { mergeFixtureStates } from '../../util/shared'
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
        setFixtureGroupState(
          group.id,
          mergeFixtureStates(groupState, partialState)
        )
      }
    />
  )
}
