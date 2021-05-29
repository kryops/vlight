import { css } from '@linaria/core'
import { ValueRange } from '@vlight/types'
import {
  valueRange,
  roundToStep,
  fractionToValue,
  valueToFraction,
} from '@vlight/utils'

import { useDelayedState } from '../../../hooks/delayed-state'
import { memoInProduction } from '../../../util/development'
import { iconShade } from '../../styles'

import {
  faderWidth,
  FaderBase,
  trackMargin,
  trackWidth,
  trackHeight,
  trackOffset,
} from './fader-base'
import { FaderButton } from './fader-button'

const track = css`
  position: absolute;
  left: ${trackMargin}px;
  background: ${iconShade(2)};
  width: ${trackWidth}px;
  z-index: 2;
`

export interface RangeFaderProps {
  value: ValueRange<number>
  min?: number
  max?: number
  step?: number
  cornerLabel?: string
  cornerLabelOverflow?: boolean
  onChange: (value: ValueRange<number>) => void
  colorPicker?: boolean
  className?: string
}

export const RangeFader = memoInProduction(
  ({
    value,
    min = 0,
    max = 100,
    step,
    onChange,
    ...passThrough
  }: RangeFaderProps) => {
    const [localValue, setLocalValue] =
      useDelayedState<ValueRange<number> | null>(null)
    const valueToUse = localValue ?? value

    const getFraction = (coordinate: number) =>
      valueToFraction(coordinate, min, max)

    return (
      <FaderBase
        {...passThrough}
        onTouch={fraction => {
          const rawCoordinate = fractionToValue(fraction, min, max)

          const newRawValue =
            Math.abs(valueToUse.from - rawCoordinate) <
              Math.abs(valueToUse.to - rawCoordinate) ||
            Math.abs(valueToUse.from - rawCoordinate) >
              Math.abs(min - rawCoordinate)
              ? valueRange(rawCoordinate, valueToUse.to)
              : valueRange(valueToUse.from, rawCoordinate)

          setLocalValue(newRawValue)
          const roundedValue = valueRange(
            roundToStep(newRawValue.from, step),
            roundToStep(newRawValue.to, step)
          )
          onChange(roundedValue)
        }}
        onUp={() => setLocalValue(null, true)}
      >
        <div
          className={track}
          style={{
            top:
              Math.round(
                trackOffset + trackHeight * (1 - getFraction(valueToUse.to))
              ) + 'px',
            height:
              Math.round(
                trackHeight *
                  (getFraction(valueToUse.to) - getFraction(valueToUse.from))
              ) + 'px',
          }}
        />
        {[valueToUse.from, valueToUse.to].map((coordinate, index) => (
          <FaderButton
            key={index}
            fraction={getFraction(coordinate)}
            height={faderWidth / 4}
          />
        ))}
      </FaderBase>
    )
  }
)
