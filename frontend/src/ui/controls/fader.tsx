import { css } from 'linaria'
import React, { memo, useRef, useState } from 'react'

import { ensureBetween, roundToStep } from '../../util/number'
import { getTouchEventOffset } from '../../util/touch'
import { Touchable } from '../helpers/touchable'
import { baselinePx, iconShade, primaryShade } from '../styles'

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
  margin: ${baselinePx * 1.5}px;
`

const track = css`
  position: absolute;
  top: ${buttonHeight / 2}px;
  left: ${trackMargin}px;
  background: ${iconShade(2)};
  width: ${trackWidth}px;
  height: ${trackHeight}px;
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

export interface Props {
  value: number
  min?: number
  max?: number
  step?: number
  label?: string
  onChange: (value: number) => void
}

const _Fader: React.SFC<Props> = ({
  value,
  min = 0,
  max = 100,
  step,
  label,
  onChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const touchActive = useRef<boolean>(false)
  const [rawValue, setRawValue] = useState(value)

  const valueToUse = touchActive.current ? rawValue : value
  const currentFraction = (valueToUse - min) / (max - min)
  const y = Math.round(trackHeight - currentFraction * trackHeight)

  return (
    <Touchable
      className={fader}
      onTouch={e => {
        const offset = getTouchEventOffset(e, trackRef)
        if (!offset) {
          return
        }
        const fraction = ensureBetween(1 - offset.yFraction, 0, 1)
        const newRawValue = min + fraction * (max - min)
        if (newRawValue === valueToUse) {
          return
        }
        setRawValue(newRawValue)
        const roundedValue = roundToStep(newRawValue, step)
        onChange(roundedValue)
      }}
      onDown={() => (touchActive.current = true)}
      onUp={() => (touchActive.current = false)}
    >
      <div className={track} ref={trackRef} />
      <div className={button} style={{ transform: `translateY(${y}px)` }}>
        {label}
      </div>
    </Touchable>
  )
}

export const Fader = memo(_Fader)

/**
 * Use this variant in situations where you render lots of faders
 * and can't use `useCallback()` to memoize callbacks (e.g. in loops),
 * but you need optimal performance.
 *
 * NOTE: You cannot access state variables from the `onChange` handler
 * directly, you have to access them through a `ref`
 */
export const PureDangerousFader = memo(
  _Fader,
  (prev, next) => prev.value === next.value && prev.label === next.label
)
