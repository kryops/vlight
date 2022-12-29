import { FixtureState } from '@vlight/types'
import { ReactNode, useCallback, useState } from 'react'
import { ChannelType } from '@vlight/controls'
import { css } from '@linaria/core'

import { Widget } from '../../ui/containers/widget'
import { ColorPicker } from '../../ui/controls/colorpicker'
import {
  ColorPickerColor,
  colorPickerColors,
  fixtureStateToColor,
} from '../../ui/controls/colorpicker/util'
import { memoInProduction } from '../../util/development'
import { iconColorPicker } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { faderContainer } from '../../ui/css/fader-container'
import { getFixtureStateColor } from '../../util/fixtures'
import { FixtureStateFader } from '../../ui/controls/fader/fixture-state-fader'
import { baseline } from '../../ui/styles'

const colorPickerIconStyle = css`
  margin-left: ${baseline(2)};
`

export interface FixtureStateWidgetProps {
  fixtureState: FixtureState

  /** Channel type mapping. */
  mapping: string[]

  icon?: string
  title?: string
  titleSide?: ReactNode
  onChange: (newState: Partial<FixtureState>) => void

  /**
   * Controls whether to disable the on button in the widget.
   *
   * Defaults to `false`.
   */
  disableOn?: boolean

  className?: string
}

/**
 * Stateless low-level widget to display a fixture state.
 */
export const FixtureStateWidget = memoInProduction(
  ({
    fixtureState,
    mapping,
    icon,
    title,
    titleSide,
    onChange,
    disableOn = false,
    className,
  }: FixtureStateWidgetProps) => {
    const colorPickerCapable = colorPickerColors.every(c => mapping.includes(c))
    const [colorPicker, setColorPicker] = useState(true)
    const toggleColorPicker = useCallback(
      () => setColorPicker(prev => !prev),
      []
    )

    const hasColorPicker = colorPicker && colorPickerCapable

    const { r, g, b } = fixtureStateToColor(fixtureState)

    const fadersToRender = mapping.filter(
      c =>
        c !== ChannelType.Master &&
        (!hasColorPicker || !colorPickerColors.includes(c))
    )

    const renderFader = (channelType: ChannelType | string, index = 0) => (
      <FixtureStateFader
        key={channelType + index}
        channelType={channelType}
        value={fixtureState.channels[channelType] ?? 0}
        onChange={onChange}
        colorPicker={
          colorPickerCapable &&
          !colorPicker &&
          colorPickerColors.includes(channelType)
        }
      />
    )

    const onColorPickerChange = useCallback(
      (color: ColorPickerColor) =>
        onChange({
          channels: { ...color },
        }),
      [onChange]
    )

    return (
      <Widget
        className={className}
        icon={icon}
        title={title}
        onTitleClick={
          disableOn
            ? undefined
            : () =>
                onChange({
                  on: !fixtureState.on,
                })
        }
        titleSide={
          titleSide || colorPickerCapable ? (
            <>
              {titleSide}
              {colorPickerCapable && (
                <Icon
                  icon={iconColorPicker}
                  onClick={toggleColorPicker}
                  shade={colorPicker ? 1 : 2}
                  inline
                  className={colorPickerIconStyle}
                />
              )}
            </>
          ) : undefined
        }
        turnedOn={disableOn ? undefined : fixtureState.on}
        bottomLineColor={getFixtureStateColor(fixtureState)}
      >
        <div className={faderContainer}>
          {renderFader(ChannelType.Master)}
          {hasColorPicker && (
            <ColorPicker r={r} g={g} b={b} onChange={onColorPickerChange} />
          )}
          {fadersToRender.map(renderFader)}
        </div>
      </Widget>
    )
  }
)
