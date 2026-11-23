import {
  roundToStep,
  fractionToValue,
  valueToFraction,
  ensureBetween,
} from '@vlight/utils'

import { useDelayedState } from '../../../hooks/delayed-state'

import { FaderBase } from './fader-base'
import { FaderButton } from './fader-button'

/** Fraction of the fader range changed per mouse wheel step. */
const wheelFractionStep = 0.04

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
   * Accessible name of the fader.
   *
   * Defaults to the {@link label}, or the {@link cornerLabel}.
   */
  ariaLabel?: string

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
export const Fader = ({
  value,
  min = 0,
  max = 100,
  quadraticScale = 1,
  step,
  label,
  subLabel,
  ariaLabel,
  onChange,
  ...passThrough
}: FaderProps) => {
  const [localValue, setLocalValue] = useDelayedState<number | null>(null)
  const valueToUse = localValue ?? value

  const onTouch = (fraction: number): void => {
    const newRawValue = fractionToValue(fraction, min, max, quadraticScale)
    if (newRawValue === valueToUse) {
      return
    }
    setLocalValue(newRawValue)
    const roundedValue = roundToStep(newRawValue, step)
    onChange(roundedValue)
  }

  const onUp = () => setLocalValue(null, true)

  const onWheel = (direction: 1 | -1): void => {
    const currentFraction = valueToFraction(
      valueToUse,
      min,
      max,
      quadraticScale
    )
    let newValue = roundToStep(
      fractionToValue(
        ensureBetween(currentFraction + direction * wheelFractionStep, 0, 1),
        min,
        max,
        quadraticScale
      ),
      step
    )
    // make sure coarse steps are not swallowed by rounding
    if (step && newValue === roundToStep(valueToUse, step)) {
      newValue = valueToUse + direction * step
    }
    newValue = ensureBetween(newValue, min, max)
    if (newValue === valueToUse) {
      return
    }
    setLocalValue(newValue)
    setLocalValue(null, true) // drop the local value once the update arrived
    onChange(newValue)
  }

  return (
    <FaderBase
      {...passThrough}
      onTouch={onTouch}
      onUp={onUp}
      onWheel={onWheel}
      aria={{
        role: 'slider',
        'aria-label': ariaLabel ?? label ?? passThrough.cornerLabel,
        'aria-valuenow': roundToStep(valueToUse, step),
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuetext': subLabel,
        'aria-orientation': 'vertical',
      }}
    >
      <FaderButton
        fraction={valueToFraction(valueToUse, min, max, quadraticScale)}
        label={label}
        subLabel={subLabel}
      />
    </FaderBase>
  )
}
