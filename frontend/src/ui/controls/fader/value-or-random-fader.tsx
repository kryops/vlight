import { ValueOrRandom } from '@vlight/types'
import { isValueRange, valueToFraction } from '@vlight/utils'

import { useEvent } from '../../../hooks/performance'
import { memoInProduction } from '../../../util/development'
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
  onChange: (value: ValueOrRandom<number>) => void
}

/**
 * Fader that supports
 * - a single value
 * - multiple values
 * - a range of values
 */
export const ValueOrRandomFader = memoInProduction(
  ({
    value,
    min = 0,
    max = 100,
    step,
    quadraticScale = 1,
    label,
    onChange,
  }: ValueOrRandomFaderProps) => {
    let fader: JSX.Element

    const openEditor = useEvent(async () => {
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
    })

    const switchBetweenTypes = useEvent(() =>
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
        />
      )
    } else if (Array.isArray(value)) {
      fader = (
        <FaderBase onUp={openEditor}>
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
)
