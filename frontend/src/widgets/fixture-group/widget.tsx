import { FixtureState, FixtureGroup } from '@vlight/entities'
import React, { useCallback, useRef } from 'react'

import { changeFixtureGroupState } from '../../api'
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
import { ChannelMapping } from '../../util/shared'
import { getFixtureStateColor } from '../../util/fixtures'

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
    const groupStateRef = useRef(groupState)
    groupStateRef.current = groupState

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
        value={groupState.channels[channelType] ?? 0}
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
        title={`${group.name ?? group.id} (${group.fixtures.length})`}
        onTitleClick={() =>
          changeFixtureGroupState(group.id, groupState, {
            on: !groupState.on,
          })
        }
        titleSide={
          colorPickerCapable ? (
            <Icon
              icon={iconColorPicker}
              onClick={toggleColorPicker}
              shade={colorPicker ? 1 : 2}
            />
          ) : undefined
        }
        turnedOn={groupState.on}
        bottomLineColor={getFixtureStateColor(groupState)}
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
