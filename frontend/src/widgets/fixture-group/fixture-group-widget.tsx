import { FixtureGroup } from '@vlight/types'
import { mergeFixtureStates } from '@vlight/controls'

import { setFixtureGroupState } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { FixtureStateWidget } from '../fixture/fixture-state-widget'
import { Icon } from '../../ui/icons/icon'
import { iconConfig } from '../../ui/icons'
import { openEntityEditorForId } from '../../pages/config/entities/editors'

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
      titleSide={
        <Icon
          icon={iconConfig}
          onClick={() => openEntityEditorForId('fixtureGroups', group.id)}
          shade={1}
          hoverable
          inline
        />
      }
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
