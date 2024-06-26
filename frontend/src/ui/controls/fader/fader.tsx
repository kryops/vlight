import { roundToStep, fractionToValue, valueToFraction } from '@vlight/utils'

import { useDelayedState } from '../../../hooks/delayed-state'
import { useEvent } from '../../../hooks/performance'
import { memoInProduction } from '../../../util/development'

import { FaderBase } from './fader-base'
import { FaderButton } from './fader-button'

export interface FaderProps {
  /** The current fader value. */
  value: number

  /** Minimum value. Defaults to 0. */
  min?: number

  /** Maximum value. Defaults to 100. */
  max?: number

  /** Step size. If set, rounds the value accordingly. */
  step?: number

  /**
   * If set, the fader uses a quadratic scale with the given exponent
   * instead of a linear scale.
   */
  quadraticScale?: number

  /** Primary label. */
  label?: string

  /** Secondary label displayed below the primary one. */
  subLabel?: string

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

  onChange: (value: number) => void

  className?: string
}

/**
 * Standard fader component.
 */
export const Fader = memoInProduction(
  ({
    value,
    min = 0,
    max = 100,
    quadraticScale = 1,
    step,
    label,
    subLabel,
    onChange,
    ...passThrough
  }: FaderProps) => {
    const [localValue, setLocalValue] = useDelayedState<number | null>(null)
    const valueToUse = localValue ?? value

    const onTouch = useEvent((fraction: number): void => {
      const newRawValue = fractionToValue(fraction, min, max, quadraticScale)
      if (newRawValue === valueToUse) {
        return
      }
      setLocalValue(newRawValue)
      const roundedValue = roundToStep(newRawValue, step)
      onChange(roundedValue)
    })

    const onUp = useEvent(() => setLocalValue(null, true))

    return (
      <FaderBase {...passThrough} onTouch={onTouch} onUp={onUp}>
        <FaderButton
          fraction={valueToFraction(valueToUse, min, max, quadraticScale)}
          label={label}
          subLabel={subLabel}
        />
      </FaderBase>
    )
  }
)
