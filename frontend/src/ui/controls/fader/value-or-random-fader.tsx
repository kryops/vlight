import { ValueOrRandom } from '@vlight/types'
import { isValueRange, valueToFraction } from '@vlight/utils'

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
  min?: number
  max?: number
  step?: number
  label?: string
  onChange: (value: ValueOrRandom<number>) => void
}

export const ValueOrRandomFader = memoInProduction(
  ({
    value,
    min = 0,
    max = 100,
    step,
    label,
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
          />
        ),
        okCancel
      )
      if (result === undefined) return
      onChange(result)
    }

    if (isValueRange(value)) {
      fader = (
        <RangeFader
          value={value}
          min={min}
          max={max}
          step={step}
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
              fraction={valueToFraction(it, min, max)}
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
          onClick={() =>
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
          }
        />
      </div>
    )
  }
)
