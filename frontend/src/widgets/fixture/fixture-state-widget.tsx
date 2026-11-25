import { FixtureChannelState, FixtureState } from '@vlight/types'
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
import {
  iconColorPicker,
  iconLight,
  iconMemory,
  iconPositionPicker,
} from '../../ui/icons'
import { Touchable } from '../../ui/components/touchable'
import { Icon } from '../../ui/icons/icon'
import { faderContainer } from '../../ui/css/fader-container'
import { getFixtureStateColor } from '../../util/fixtures'
import { FixtureStateFader } from '../../ui/controls/fader/fixture-state-fader'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'
import { PositionPicker } from '../../ui/controls/position-picker'
import {
  Position,
  positionChannels,
} from '../../ui/controls/position-picker/utils'

const colorPickerIconStyle = css`
  margin-left: ${baseline(2)};
`

const flashStyle = css`
  display: inline-block;
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

  /** Named channel state tables per channel type (one per fixture type). */
  channelStates?: Record<string, FixtureChannelState[][]>

  icon?: string
  title?: string
  titleSide?: ReactNode
  onChange: (newState: Partial<FixtureState>) => void
  onSave?: () => void

  /** Displays a flash (instant on/off) button if set. */
  onFlash?: (on: boolean) => void

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
export const FixtureStateWidget = ({
  fixtureState,
  mapping,
  channelStates,
  icon,
  title,
  titleSide,
  onChange,
  onSave,
  onFlash,
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
      states={channelStates?.[channelType]}
      colorPicker={
        colorPickerCapable &&
        !colorPicker &&
        colorPickerColors.includes(channelType)
      }
    />
  )

  const onPickerChange = (color: ColorPickerColor | Position) =>
    onChange({
      channels: { ...color },
    })

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
        onFlash ||
        colorPickerCapable ||
        positionPickerCapable ||
        (onSave && !fixtureState.initial) ? (
          <>
            {titleSide}
            {colorPickerCapable && (
              <Icon
                title="Color picker"
                icon={iconColorPicker}
                onClick={toggleColorPicker}
                shade={colorPicker ? 1 : 2}
                inline
                className={colorPickerIconStyle}
              />
            )}
            {positionPickerCapable && (
              <Icon
                title="Position picker"
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
                title="Save into Memory"
                onClick={onSave}
                shade={1}
                hoverable
                inline
                className={colorPickerIconStyle}
              />
            )}
            {onFlash && (
              <Touchable
                className={flashStyle}
                title="Instant on/off"
                role="button"
                aria-label="Instant on/off"
                onDown={() => onFlash(true)}
                onUp={() => onFlash(false)}
              >
                <Icon icon={iconLight} shade={1} hoverable inline />
              </Touchable>
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
