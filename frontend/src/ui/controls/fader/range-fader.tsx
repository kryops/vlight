import { css } from '@linaria/core'
import { roundToStep } from '@vlight/utils'

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
  value: [number, number]
  min?: number
  max?: number
  step?: number
  cornerLabel?: string
  cornerLabelOverflow?: boolean
  onChange: (value: [number, number]) => void
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
    const [localValue, setLocalValue] = useDelayedState<
      [number, number] | null
    >(null)
    const valueToUse = localValue ?? value

    const getFraction = (coordinate: number) => (coordinate - min) / (max - min)

    return (
      <FaderBase
        {...passThrough}
        onTouch={fraction => {
          const rawCoordinate = min + fraction * (max - min)
          const closestCoordinate =
            Math.abs(valueToUse[0] - rawCoordinate) <
            Math.abs(valueToUse[1] - rawCoordinate)
              ? 0
              : 1

          const newRawValue: [number, number] =
            closestCoordinate === 0
              ? [rawCoordinate, valueToUse[1]]
              : [valueToUse[0], rawCoordinate]

          setLocalValue(newRawValue)
          const roundedValue = newRawValue.map(it => roundToStep(it, step)) as [
            number,
            number
          ]
          onChange(roundedValue)
        }}
        onUp={() => setLocalValue(null, true)}
      >
        <div
          className={track}
          style={{
            top:
              Math.round(
                trackOffset + trackHeight * (1 - getFraction(valueToUse[1]))
              ) + 'px',
            height:
              Math.round(
                trackHeight *
                  (getFraction(valueToUse[1]) - getFraction(valueToUse[0]))
              ) + 'px',
          }}
        />
        {valueToUse.map((coordinate, index) => (
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
