import { css } from 'linaria'
import React, { useRef } from 'react'

import { Touchable } from '../../components/touchable'
import { useDelayedState } from '../../../hooks/delayed-state'
import { useSettings } from '../../../hooks/settings'
import { ensureBetween, roundToStep } from '../../../util/shared'
import { getTouchEventOffset } from '../../../util/touch'
import { memoInProduction } from '../../../util/development'
import { cx } from '../../../util/styles'
import { baseline, iconShade, primaryShade, baselinePx } from '../../styles'

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
  background: ${primaryShade(2)};
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`

const button_light = css`
  background: ${primaryShade(0, true)};
  color: #fff;
`

export interface FaderProps {
  value: number
  min?: number
  max?: number
  step?: number
  label?: string
  onChange: (value: number) => void
  colorPicker?: boolean
}

export const Fader = memoInProduction(
  ({
    value,
    min = 0,
    max = 100,
    step,
    label,
    onChange,
    colorPicker,
  }: FaderProps) => {
    const trackRef = useRef<HTMLDivElement>(null)
    const [localValue, setLocalValue] = useDelayedState<number | null>(null)
    const { lightMode } = useSettings()

    const valueToUse = localValue ?? value
    const currentFraction = (valueToUse - min) / (max - min)
    const y = Math.round(trackHeight - currentFraction * trackHeight)

    return (
      <Touchable
        className={cx(fader, { [colorPickerFader]: colorPicker })}
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
        <div className={cx(track, lightMode && track_light)} ref={trackRef} />
        <div
          className={cx(button, lightMode && button_light)}
          style={{ transform: `translateY(${y}px)` }}
        >
          {label}
        </div>
      </Touchable>
    )
  }
)
