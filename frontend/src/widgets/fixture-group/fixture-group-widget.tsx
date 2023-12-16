import { FixtureGroup, FixtureState } from '@vlight/types'
import { FixtureMappingPrefix, mergeFixtureStates } from '@vlight/controls'

import { setFixtureGroupState } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { FixtureStateWidget } from '../fixture/fixture-state-widget'
import { Icon } from '../../ui/icons/icon'
import { iconConfig, iconGroup } from '../../ui/icons'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { memoInProduction } from '../../util/development'
import { useEvent } from '../../hooks/performance'
import { WidgetPassthrough } from '../../ui/containers/widget'
import { addMemoryFromFixtureState } from '../../pages/memories/memories-actions'

export interface FixtureGroupWidgetProps extends WidgetPassthrough {
  group: FixtureGroup
  mapping?: string[]
}

/**
 * Widget to display a fixture group.
 */
export const FixtureGroupWidget = memoInProduction(
  ({ group, mapping, ...passThrough }: FixtureGroupWidgetProps) => {
    const groupState = useApiStateEntry('fixtureGroups', group.id)
    const groupMapping = useCommonFixtureMapping(group.fixtures, mapping)

    const onChange = useEvent((partialState: Partial<FixtureState>) =>
      setFixtureGroupState(
        group.id,
        mergeFixtureStates(groupState, partialState)
      )
    )

    const onSave = useEvent(async () => {
      await addMemoryFromFixtureState({
        fixtureState: groupState,
        members: [FixtureMappingPrefix.Group + group.id],
        initialName: group.name,
      })
    })

    const openEditor = useEvent(() =>
      openEntityEditorForId('fixtureGroups', group.id)
    )

    if (!groupState) {
      return null
    }

    return (
      <FixtureStateWidget
        icon={iconGroup}
        title={`${group.name ?? group.id}`}
        titleSide={
          <Icon
            icon={iconConfig}
            onClick={openEditor}
            shade={1}
            hoverable
            inline
          />
        }
        fixtureState={groupState}
        mapping={groupMapping}
        {...passThrough}
        onChange={onChange}
        onSave={onSave}
        limitedWidth
      />
    )
  }
)
