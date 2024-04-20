import { css } from '@linaria/core'
import { ValueRange } from '@vlight/types'
import {
  valueRange,
  roundToStep,
  fractionToValue,
  valueToFraction,
} from '@vlight/utils'

import { useDelayedState } from '../../../hooks/delayed-state'
import { useEvent } from '../../../hooks/performance'
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
  /** The current fader range. */
  value: ValueRange<number>

  /** Minimum value. Defaults to 0. */
  min?: number

  /** Maximum value. Defaults to 100. */
  max?: number

  /** Step size. If set, rounds the range values accordingly. */
  step?: number

  /**
   * If set, the fader uses a quadratic scale with the given exponent
   * instead of a linear scale.
   */
  quadraticScale?: number

  /**
   * Label to display in the top-left corner.
   *
   * The display of long labels can be controlled via {@link cornerLabelOverflow}.
   */
  cornerLabel?: string

  /**
   * Controls whether the corner label can overflow the fader container.
   *
   * Defaults to `false`.
   */
  cornerLabelOverflow?: boolean

  /**
   * Controls whether the fader is part of a color picker.
   *
   * Changes the margins so the content will not jump when switching between
   * the color picker and the faders.
   *
   * Defaults to `false`.
   */
  colorPicker?: boolean

  onChange: (value: ValueRange<number>) => void
  className?: string
}

/**
 * Fader that controls a range between 2 values.
 */
export const RangeFader = memoInProduction(
  ({
    value,
    min = 0,
    max = 100,
    quadraticScale = 1,
    step,
    onChange,
    ...passThrough
  }: RangeFaderProps) => {
    const [localValue, setLocalValue] =
      useDelayedState<ValueRange<number> | null>(null)
    const valueToUse = localValue ?? value

    const getFraction = (coordinate: number) =>
      valueToFraction(coordinate, min, max, quadraticScale)

    const onTouch = useEvent((fraction: number): void => {
      const rawCoordinate = fractionToValue(fraction, min, max, quadraticScale)

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
    })

    const onUp = useEvent(() => setLocalValue(null, true))

    return (
      <FaderBase {...passThrough} onTouch={onTouch} onUp={onUp}>
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
