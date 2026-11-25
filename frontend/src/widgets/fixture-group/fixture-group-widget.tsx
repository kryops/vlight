import { FixtureGroup, FixtureState } from '@vlight/types'
import { FixtureMappingPrefix, mergeFixtureStates } from '@vlight/controls'

import { setFixtureGroupState } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import {
  useCommonChannelStates,
  useCommonFixtureMapping,
} from '../../hooks/fixtures'
import { FixtureStateWidget } from '../fixture/fixture-state-widget'
import { Icon } from '../../ui/icons/icon'
import { iconConfig, iconGroup } from '../../ui/icons'
import { openEntityEditorForId } from '../../pages/config/entities/editors'
import { WidgetPassthrough } from '../../ui/containers/widget'
import { addMemoryFromFixtureState } from '../../pages/memories/memories-actions'

export interface FixtureGroupWidgetProps extends WidgetPassthrough {
  group: FixtureGroup
  mapping?: string[]
}

/**
 * Widget to display a fixture group.
 */
export const FixtureGroupWidget = ({
  group,
  mapping,
  ...passThrough
}: FixtureGroupWidgetProps) => {
  const groupState = useApiStateEntry('fixtureGroups', group.id)
  const groupMapping = useCommonFixtureMapping(group.fixtures, mapping)
  const channelStates = useCommonChannelStates(group.fixtures)

  const onChange = (partialState: Partial<FixtureState>) =>
    setFixtureGroupState(group.id, mergeFixtureStates(groupState, partialState))

  const onSave = async () => {
    await addMemoryFromFixtureState({
      fixtureState: groupState,
      members: [FixtureMappingPrefix.Group + group.id],
      initialName: group.name,
    })
  }

  const openEditor = () => openEntityEditorForId('fixtureGroups', group.id)

  if (!groupState) {
    return null
  }

  return (
    <FixtureStateWidget
      icon={iconGroup}
      title={`${group.name ?? group.id}`}
      titleSide={
        <Icon
          title="Edit group"
          icon={iconConfig}
          onClick={openEditor}
          shade={1}
          hoverable
          inline
        />
      }
      fixtureState={groupState}
      mapping={groupMapping}
      channelStates={channelStates}
      {...passThrough}
      onChange={onChange}
      onSave={onSave}
      limitedWidth
    />
  )
}
