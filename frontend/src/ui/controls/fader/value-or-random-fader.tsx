import { ValueOrRandom } from '@vlight/types'
import { isValueRange, valueToFraction } from '@vlight/utils'
import { JSX } from 'react'

import { FaderHotkeys } from '../../../hooks/fader-hotkeys'

import { Button } from '../../buttons/button'
import { centeredText, smallText } from '../../css/basic-styles'
import { iconMultiple, iconRange, iconSingle } from '../../icons'
import { okCancel } from '../../overlays/buttons'
import { showDialogWithReturnValue } from '../../overlays/dialog'

import { Fader } from './fader'
import { FaderBase } from './fader-base'
import { FaderButton } from './fader-button'
import { RangeFader } from './range-fader'
import {
  convertValueOrRandom,
  ValueOrRandomFaderEditor,
  ValueOrRandomType,
} from './value-or-random-fader-editor'

export interface ValueOrRandomFaderProps {
  value: ValueOrRandom<number>

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

  label?: string

  /** Secondary label to display on the fader button (only for single values). */
  subLabel?: string

  /**
   * Keys to move the fader up and down while they are held
   * (only for single values).
   */
  hotkeys?: FaderHotkeys

  onChange: (value: ValueOrRandom<number>) => void
}

/**
 * Fader that supports
 * - a single value
 * - multiple values
 * - a range of values
 */
export const ValueOrRandomFader = ({
  value,
  min = 0,
  max = 100,
  step,
  quadraticScale = 1,
  label,
  subLabel,
  hotkeys,
  onChange,
}: ValueOrRandomFaderProps) => {
  let fader: JSX.Element

  const openEditor = async () => {
    const result = await showDialogWithReturnValue<ValueOrRandom<number>>(
      onChange => (
        <ValueOrRandomFaderEditor
          title={label}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          quadraticScale={quadraticScale}
        />
      ),
      okCancel
    )
    if (result === undefined) return
    onChange(result)
  }

  const switchBetweenTypes = () =>
    onChange(
      convertValueOrRandom(
        value,
        typeof value === 'number'
          ? ValueOrRandomType.Values
          : isValueRange(value)
            ? ValueOrRandomType.Value
            : ValueOrRandomType.Range,
        0
      )
    )

  if (isValueRange(value)) {
    fader = (
      <RangeFader
        value={value}
        min={min}
        max={max}
        step={step}
        quadraticScale={quadraticScale}
        onChange={onChange}
        aria={{ role: 'group', 'aria-label': label }}
      />
    )
  } else if (Array.isArray(value)) {
    fader = (
      <FaderBase
        onUp={openEditor}
        aria={{ role: 'button', 'aria-label': label }}
      >
        {value.map((it, index) => (
          <FaderButton
            key={index}
            height={2}
            fraction={valueToFraction(it, min, max, quadraticScale)}
          />
        ))}
      </FaderBase>
    )
  } else {
    fader = (
      <Fader
        value={value}
        min={min}
        max={max}
        step={step}
        quadraticScale={quadraticScale}
        onChange={onChange}
        ariaLabel={label}
        subLabel={subLabel}
        hotkeys={hotkeys}
      />
    )
  }

  return (
    <div className={centeredText}>
      {fader}
      {label && <div className={smallText}>{label}</div>}
      <Button
        icon={
          typeof value === 'number'
            ? iconSingle
            : Array.isArray(value)
              ? iconMultiple
              : iconRange
        }
        title={
          typeof value === 'number'
            ? 'Single value'
            : Array.isArray(value)
              ? 'Multiple discrete values. Click on the fader to configure'
              : 'Value range'
        }
        transparent
        onClick={switchBetweenTypes}
      />
    </div>
  )
}
