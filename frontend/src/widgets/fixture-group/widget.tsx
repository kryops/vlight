import { FixtureState, FixtureGroup } from '@vlight/entities'
import React, { useCallback } from 'react'

import { changeFixtureGroupState } from '../../api'
import { ChannelMapping } from '../../api/enums'
import { useCurrentRef } from '../../hooks/ref'
import { Widget } from '../../ui/containers/widget'
import { ColorPicker } from '../../ui/controls/colorpicker'
import {
  colorPickerColors,
  fixtureStateToColor,
} from '../../ui/controls/colorpicker/util'
import { FixtureStateFader } from '../../ui/controls/fader/fixture-state-fader'
import { memoInProduction } from '../../util/development'
import { iconColorPicker } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { faderContainer } from '../../ui/css/fader-container'
import { widgetTitle, widgetTurnedOff } from '../../ui/css/widget'

export interface StatelessFixtureGroupWidgetProps {
  group: FixtureGroup
  groupMapping: string[]
  groupState: FixtureState
  colorPicker?: boolean
  toggleColorPicker?: () => void
}

export const StatelessFixtureGroupWidget = memoInProduction(
  ({
    group,
    groupMapping,
    groupState,
    colorPicker,
    toggleColorPicker,
  }: StatelessFixtureGroupWidgetProps) => {
    const groupStateRef = useCurrentRef(groupState)

    const colorPickerCapable = colorPickerColors.every(c =>
      groupMapping.includes(c)
    )
    const hasColorPicker = colorPicker && colorPickerCapable

    const { r, g, b } = fixtureStateToColor(groupState)

    const fadersToRender = groupMapping.filter(
      c =>
        c !== ChannelMapping.master &&
        (!hasColorPicker || !colorPickerColors.includes(c))
    )

    const renderFader = (channelType: string, index = 0) => (
      <FixtureStateFader
        key={channelType + index}
        id={group.id}
        channelType={channelType}
        value={groupState.channels[channelType] || 0}
        stateRef={groupStateRef}
        changeFn={changeFixtureGroupState}
        colorPicker={
          colorPickerCapable &&
          !colorPicker &&
          colorPickerColors.includes(channelType)
        }
      />
    )

    const onColorPickerChange = useCallback(
      color =>
        changeFixtureGroupState(group.id, groupState, {
          channels: { ...color },
        }),
      [group.id, groupState]
    )

    return (
      <Widget
        key={group.id}
        title={
          <div className={widgetTitle}>
            <a
              onClick={() =>
                changeFixtureGroupState(group.id, groupState, {
                  on: !groupState.on,
                })
              }
            >
              {group.name || group.id} ({group.fixtures.length}){' '}
              {!groupState.on && '[OFF]'}
            </a>
            {colorPickerCapable && (
              <Icon
                icon={iconColorPicker}
                onClick={toggleColorPicker}
                shade={colorPicker ? 1 : 2}
              />
            )}
          </div>
        }
        className={groupState.on ? undefined : widgetTurnedOff}
      >
        <div className={faderContainer}>
          {renderFader('m')}
          {hasColorPicker && (
            <ColorPicker r={r} g={g} b={b} onChange={onColorPickerChange} />
          )}
          {fadersToRender.map(renderFader)}
        </div>
      </Widget>
    )
  }
)
