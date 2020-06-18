import { Fixture, FixtureState, FixtureType } from '@vlight/entities'
import React, { useCallback } from 'react'

import { changeFixtureState } from '../../api'
import { useCurrentRef } from '../../hooks/ref'
import { iconColorPicker } from '../../ui/icons'
import { Widget } from '../../ui/containers/widget'
import { ColorPicker } from '../../ui/controls/colorpicker'
import {
  colorPickerColors,
  fixtureStateToColor,
} from '../../ui/controls/colorpicker/util'
import { FixtureStateFader } from '../../ui/controls/fader/fixture-state-fader'
import { faderContainer } from '../../ui/css/fader-container'
import { memoInProduction } from '../../util/development'
import { Icon } from '../../ui/icons/icon'
import { ChannelMapping } from '../../util/shared'
import { getFixtureStateColor } from '../../util/fixtures'

export function getFixtureName(
  fixture: Fixture,
  fixtureType: FixtureType
): string {
  if (fixture.name) {
    return `${fixture.channel} ${fixture.name}`
  }
  return `${fixture.channel} ${fixtureType.name}`
}

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
        value={fixtureState.channels[channelType] ?? 0}
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
        title={getFixtureName(fixture, fixtureType)}
        titleSide={
          colorPickerCapable ? (
            <Icon
              icon={iconColorPicker}
              onClick={toggleColorPicker}
              shade={colorPicker ? 1 : 2}
            />
          ) : undefined
        }
        onTitleClick={() =>
          changeFixtureState(fixture.id, fixtureState, {
            on: !fixtureState.on,
          })
        }
        turnedOn={fixtureState.on}
        bottomLineColor={getFixtureStateColor(fixtureState)}
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
