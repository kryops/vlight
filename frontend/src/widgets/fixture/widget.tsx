import { Fixture, FixtureState, FixtureType } from '@vlight/entities'
import { css } from 'linaria'
import React, { useCallback } from 'react'

import { changeFixtureState } from '../../api'
import { ChannelMapping } from '../../api/enums'
import { iconColorPicker } from '../../ui/icons'
import { Widget } from '../../ui/containers/widget'
import { ColorPicker } from '../../ui/controls/colorpicker'
import {
  colorPickerColors,
  fixtureStateToColor,
} from '../../ui/controls/colorpicker/util'
import { FixtureStateFader } from '../../ui/controls/fader/fixture-state-fader'
import { baselinePx } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { Icon } from '../../ui/icons/icon'
import { useCurrentRef } from '../../hooks/ref'

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
    opacity: 0.75;
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

export interface StatelessFixtureWidgetProps {
  fixture: Fixture
  fixtureType: FixtureType
  fixtureState: FixtureState
  colorPicker?: boolean
  toggleColorPicker?: () => void
}

export const StatelessFixtureWidget = memoInProduction(
  ({
    fixture,
    fixtureType,
    fixtureState,
    colorPicker = true,
    toggleColorPicker,
  }: StatelessFixtureWidgetProps) => {
    const fixtureStateRef = useCurrentRef(fixtureState)

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

    const renderFader = (channelType: string, index = 0) => (
      <FixtureStateFader
        key={channelType + index}
        id={fixture.id}
        channelType={channelType}
        value={fixtureState.channels[channelType] || 0}
        stateRef={fixtureStateRef}
        changeFn={changeFixtureState}
        colorPicker={
          colorPickerCapable &&
          !colorPicker &&
          colorPickerColors.includes(channelType)
        }
      />
    )

    const onColorPickerChange = useCallback(
      color =>
        changeFixtureState(fixture.id, fixtureState, {
          channels: { ...color },
        }),
      [fixture.id, fixtureState]
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
              {getFixtureName(fixture, fixtureType)}{' '}
              {!fixtureState.on && '[OFF]'}
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
            <ColorPicker r={r} g={g} b={b} onChange={onColorPickerChange} />
          )}
          {fadersToRender.map(renderFader)}
        </div>
      </Widget>
    )
  }
)
