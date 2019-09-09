import { FixtureState, FixtureGroup } from '@vlight/entities'
import { css } from 'linaria'
import React from 'react'

import { changeFixtureGroupState } from '../../api'
import { ChannelMapping } from '../../api/enums'
import { Widget } from '../../ui/containers/widget'
import { ColorPicker } from '../../ui/controls/colorpicker'
import {
  colorPickerColors,
  fixtureStateToColor,
} from '../../ui/controls/colorpicker/util'
import { Fader } from '../../ui/controls/fader'
import { baselinePx } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { iconColorPicker } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'

const title = css`
  display: flex;

  & > :first-child {
    flex-grow: 1;
  }
`

const turnedOff = css`
  & > * {
    opacity: 0.4;
  }
`

const faderContainer = css`
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  max-width: 100%;
  /* horizontal scrolling */
  padding-bottom: ${baselinePx * 8}px;

  /* justify-content: center does not work with overflow */
  & > :first-child {
    margin-left: auto;
  }
  & > :last-child {
    margin-right: auto;
  }
`

interface StatelessProps {
  group: FixtureGroup
  groupMapping: string[]
  groupState: FixtureState
  colorPicker?: boolean
  toggleColorPicker?: () => void
}

const _StatelessFixtureGroupWidget: React.SFC<StatelessProps> = ({
  group,
  groupMapping,
  groupState,
  colorPicker,
  toggleColorPicker,
}) => {
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
    <Fader
      key={channelType + index}
      max={255}
      step={1}
      label={channelType.toUpperCase()}
      value={groupState.channels[channelType] || 0}
      onChange={value =>
        changeFixtureGroupState(group.id, groupState, {
          channels: {
            [channelType]: value,
          },
        })
      }
      colorPicker={
        colorPickerCapable &&
        !colorPicker &&
        colorPickerColors.includes(channelType)
      }
    />
  )

  return (
    <Widget
      key={group.id}
      title={
        <div className={title}>
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
      className={groupState.on ? undefined : turnedOff}
    >
      <div className={faderContainer}>
        {renderFader('m')}
        {hasColorPicker && (
          <ColorPicker
            r={r}
            g={g}
            b={b}
            onChange={color =>
              changeFixtureGroupState(group.id, groupState, {
                channels: { ...color },
              })
            }
          />
        )}
        {fadersToRender.map(renderFader)}
      </div>
    </Widget>
  )
}

export const StatelessFixtureGroupWidget = memoInProduction(
  _StatelessFixtureGroupWidget
)
