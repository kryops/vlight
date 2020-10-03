import { css } from 'linaria'
import React, { useRef } from 'react'
import { ensureBetween, roundToStep } from '@vlight/shared'

import { Touchable } from '../../components/touchable'
import { useDelayedState } from '../../../hooks/delayed-state'
import { getTouchEventOffset } from '../../../util/touch'
import { memoInProduction } from '../../../util/development'
import { cx } from '../../../util/styles'
import { baseline, iconShade, primaryShade, baselinePx } from '../../styles'
import { useClassNames } from '../../../hooks/ui'

const faderWidth = baselinePx * 12
const faderHeight = baselinePx * 60

const buttonHeight = faderWidth * 1.25

const trackWidth = faderWidth / 3
const trackMargin = (faderWidth - trackWidth) / 2
const trackHeight = faderHeight - buttonHeight

const fader = css`
  position: relative;
  flex: 0 0 auto;
  width: ${faderWidth}px;
  height: ${faderHeight}px;
  margin: ${baseline(1.5)};
`

const colorPickerFader = css`
  margin-left: ${baseline(3.5)};
  margin-right: ${baseline(3.5)};
`

const track = css`
  position: absolute;
  top: ${buttonHeight / 2}px;
  left: ${trackMargin}px;
  background: ${iconShade(2)};
  width: ${trackWidth}px;
  height: ${trackHeight}px;
`

const track_light = css`
  background: ${iconShade(3, true)};
`

const button = css`
  position: relative;
  width: ${faderWidth};
  height: ${buttonHeight}px;
  background: ${primaryShade(1)};
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`

const button_light = css`
  background: ${primaryShade(0, true)};
  color: #fff;
`

const subLabelStyle = css`
  position: absolute;
  bottom: ${baseline()};
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.65rem;
`

const cornerLabelStyle = css`
  position: absolute;
  font-size: 0.65rem;
  z-index: 3;
  top: ${baseline(0.5)};
  left: ${baseline(1)};
`

const cornerLabel_overflow = css`
  min-width: ${baseline(32)};
`

export interface FaderProps {
  value: number
  min?: number
  max?: number
  step?: number
  label?: string
  subLabel?: string
  cornerLabel?: string
  cornerLabelOverflow?: boolean
  onChange: (value: number) => void
  colorPicker?: boolean
  className?: string
}

export const Fader = memoInProduction(
  ({
    value,
    min = 0,
    max = 100,
    step,
    label,
    subLabel,
    cornerLabel,
    cornerLabelOverflow,
    onChange,
    colorPicker,
    className,
  }: FaderProps) => {
    const trackRef = useRef<HTMLDivElement>(null)
    const [localValue, setLocalValue] = useDelayedState<number | null>(null)
    const [trackClassName, buttonClassName] = useClassNames(
      [track, track_light],
      [button, button_light]
    )

    const valueToUse = localValue ?? value
    const currentFraction = (valueToUse - min) / (max - min)
    const y = Math.round(trackHeight - currentFraction * trackHeight)

    return (
      <Touchable
        className={cx(fader, colorPicker && colorPickerFader, className)}
        onTouch={event => {
          const offset = getTouchEventOffset(event, trackRef)
          if (!offset) {
            return
          }
          const fraction = ensureBetween(1 - offset.yFraction, 0, 1)
          const newRawValue = min + fraction * (max - min)
          if (newRawValue === valueToUse) {
            return
          }
          setLocalValue(newRawValue)
          const roundedValue = roundToStep(newRawValue, step)
          onChange(roundedValue)
        }}
        onUp={() => setLocalValue(null, true)}
      >
        <div className={trackClassName} ref={trackRef} />
        <div
          className={buttonClassName}
          style={{ transform: `translateY(${y}px)` }}
        >
          {label}
          {subLabel && <div className={subLabelStyle}>{subLabel}</div>}
        </div>
        {cornerLabel && (
          <div
            className={cx(
              cornerLabelStyle,
              cornerLabelOverflow && cornerLabel_overflow
            )}
          >
            {cornerLabel}
          </div>
        )}
      </Touchable>
    )
  }
)
