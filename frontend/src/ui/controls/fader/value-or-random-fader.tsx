import { ValueOrRandom } from '@vlight/types'
import { isValueRange, valueToFraction } from '@vlight/utils'

import { memoInProduction } from '../../../util/development'
import { centeredText, smallText } from '../../css/basic-styles'
import { iconConfig } from '../../icons'
import { Icon } from '../../icons/icon'
import { okCancel } from '../../overlays/buttons'
import { showDialogWithReturnValue } from '../../overlays/dialog'

import { Fader } from './fader'
import { FaderBase } from './fader-base'
import { FaderButton } from './fader-button'
import { RangeFader } from './range-fader'
import { ValueOrRandomFaderEditor } from './value-or-random-fader-editor'

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
        <Icon icon={iconConfig} hoverable inline padding onClick={openEditor} />
      </div>
    )
  }
)
