import { FixtureGroup } from '@vlight/types'
import { mergeFixtureStates } from '@vlight/controls'

import { setFixtureGroupState } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { FixtureStateWidget } from '../fixture/fixture-state-widget'
import { Icon } from '../../ui/icons/icon'
import { iconConfig, iconGroup } from '../../ui/icons'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { memoInProduction } from '../../util/development'

export interface FixtureGroupWidgetProps {
  group: FixtureGroup
}

/**
 * Widget to display a fixture group.
 */
export const FixtureGroupWidget = memoInProduction(
  ({ group }: FixtureGroupWidgetProps) => {
    const groupState = useApiStateEntry('fixtureGroups', group.id)
    const groupMapping = useCommonFixtureMapping(group.fixtures)

    if (!groupState) {
      return null
    }

    return (
      <FixtureStateWidget
        icon={iconGroup}
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
)
