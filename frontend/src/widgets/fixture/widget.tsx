import { Fixture, FixtureState, FixtureType } from '@vlight/entities'
import { css } from 'linaria'
import React from 'react'

import { changeFixtureState } from '../../api'
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
import { Icon } from '../../ui/icons/icon'
import { iconColorPicker } from '../../ui/icons'

export function getFixtureName(
  fixture: Fixture,
  fixtureType: FixtureType
): string {
  if (fixture.name) {
    return `${fixture.channel} ${fixture.name}`
  }
  return `${fixture.channel} ${fixtureType.name}`
}

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
  padding-bottom: ${baselinePx * 8}px; // horizontal scrolling

  // justify-content: center does not work with overflow
  & > :first-child {
    margin-left: auto;
  }
  & > :last-child {
    margin-right: auto;
  }
`

interface StatelessProps {
  fixture: Fixture
  fixtureType: FixtureType
  fixtureState: FixtureState
  colorPicker?: boolean
  toggleColorPicker?: () => void
}

const _StatelessFixtureWidget: React.SFC<StatelessProps> = ({
  fixture,
  fixtureType,
  fixtureState,
  colorPicker = true,
  toggleColorPicker,
}) => {
  const colorPickerCapable = colorPickerColors.every(c =>
    fixtureType.mapping.includes(c)
  )
  const hasColorPicker = colorPicker && colorPickerCapable

  const { r, g, b } = fixtureStateToColor(fixtureState)

  const fadersToRender = fixtureType.mapping.filter(
    c =>
      c !== ChannelMapping.master &&
      (!hasColorPicker || !colorPickerColors.includes(c))
  )

  const renderFader = (channelType: string) => (
    <Fader
      key={channelType}
      max={255}
      step={1}
      label={channelType.toUpperCase()}
      value={fixtureState.channels[channelType] || 0}
      onChange={value =>
        changeFixtureState(fixture.id, fixtureState, {
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
      key={fixture.id}
      title={
        <div className={title}>
          <a
            onClick={() =>
              changeFixtureState(fixture.id, fixtureState, {
                on: !fixtureState.on,
              })
            }
          >
            {getFixtureName(fixture, fixtureType)} {!fixtureState.on && '[OFF]'}
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
      className={fixtureState.on ? undefined : turnedOff}
    >
      <div className={faderContainer}>
        {renderFader('m')}
        {hasColorPicker && (
          <ColorPicker
            r={r}
            g={g}
            b={b}
            onChange={color =>
              changeFixtureState(fixture.id, fixtureState, {
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

export const StatelessFixtureWidget = memoInProduction(_StatelessFixtureWidget)
