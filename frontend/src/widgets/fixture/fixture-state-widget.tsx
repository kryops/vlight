import { FixtureState } from '@vlight/types'
import { ReactNode, useReducer } from 'react'
import { ChannelType } from '@vlight/controls'
import { css } from '@linaria/core'

import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { ColorPicker } from '../../ui/controls/colorpicker'
import {
  ColorPickerColor,
  colorPickerColors,
  fixtureStateToColor,
} from '../../ui/controls/colorpicker/util'
import { memoInProduction } from '../../util/development'
import { iconColorPicker, iconMemory, iconPositionPicker } from '../../ui/icons'
import { Icon } from '../../ui/icons/icon'
import { faderContainer } from '../../ui/css/fader-container'
import { getFixtureStateColor } from '../../util/fixtures'
import { FixtureStateFader } from '../../ui/controls/fader/fixture-state-fader'
import { baseline } from '../../ui/styles'
import { useEvent } from '../../hooks/performance'
import { cx } from '../../util/styles'
import { PositionPicker } from '../../ui/controls/position-picker'
import {
  Position,
  positionChannels,
} from '../../ui/controls/position-picker/utils'

const colorPickerIconStyle = css`
  margin-left: ${baseline(2)};
`

const limitedWidthFaderContainer = css`
  @media (min-width: 1000px) {
    max-width: calc(50vw - ${baseline(24)});
  }
`

export interface FixtureStateWidgetProps extends WidgetPassthrough {
  fixtureState: FixtureState

  /** Channel type mapping. */
  mapping: string[]

  icon?: string
  title?: string
  titleSide?: ReactNode
  onChange: (newState: Partial<FixtureState>) => void
  onSave?: () => void

  /**
   * Controls whether to disable the on button in the widget.
   *
   * Defaults to `false`.
   */
  disableOn?: boolean

  limitedWidth?: boolean

  className?: string
}

const toggleFn: (x: boolean) => boolean = prev => !prev

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
    onSave,
    disableOn = false,
    limitedWidth = false,
    className,
    ...passThrough
  }: FixtureStateWidgetProps) => {
    const colorPickerCapable = colorPickerColors.every(c => mapping.includes(c))
    const [colorPicker, toggleColorPicker] = useReducer(toggleFn, true)
    const hasColorPicker = colorPicker && colorPickerCapable

    const positionPickerCapable =
      mapping.includes(ChannelType.Pan) && mapping.includes(ChannelType.Tilt)
    const [positionPicker, togglePositionPicker] = useReducer(toggleFn, true)
    const hasPositionPicker = positionPicker && positionPickerCapable

    const { r, g, b } = fixtureStateToColor(fixtureState)

    const fadersToRender = mapping.filter(
      (c, index) =>
        c !== ChannelType.Master &&
        (!hasColorPicker || !colorPickerColors.includes(c)) &&
        (!hasPositionPicker || !positionChannels.includes(c)) &&
        mapping.indexOf(c) === index
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

    const onPickerChange = useEvent((color: ColorPickerColor | Position) =>
      onChange({
        channels: { ...color },
      })
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
          titleSide ||
          colorPickerCapable ||
          positionPickerCapable ||
          (onSave && !fixtureState.initial) ? (
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
              {positionPickerCapable && (
                <Icon
                  icon={iconPositionPicker}
                  onClick={togglePositionPicker}
                  shade={positionPicker ? 1 : 2}
                  inline
                  className={colorPickerIconStyle}
                />
              )}
              {onSave && !fixtureState.initial && (
                <Icon
                  icon={iconMemory}
                  onClick={onSave}
                  shade={1}
                  hoverable
                  inline
                  className={colorPickerIconStyle}
                />
              )}
            </>
          ) : undefined
        }
        turnedOn={disableOn ? undefined : fixtureState.on}
        {...passThrough}
        bottomLineColor={getFixtureStateColor(fixtureState)}
      >
        <div
          className={cx(
            faderContainer,
            limitedWidth && limitedWidthFaderContainer
          )}
        >
          {renderFader(ChannelType.Master)}
          {hasColorPicker && (
            <ColorPicker r={r} g={g} b={b} onChange={onPickerChange} />
          )}
          {hasPositionPicker && (
            <PositionPicker
              pan={fixtureState.channels[ChannelType.Pan]}
              tilt={fixtureState.channels[ChannelType.Tilt]}
              onChange={onPickerChange}
            />
          )}
          {fadersToRender.map(renderFader)}
        </div>
      </Widget>
    )
  }
)
