import React, { memo, useRef, useState } from 'react'

import { ensureBetween, roundToStep } from '../../util/number'
import { getTouchEventOffset } from '../../util/touch'
import { Touchable } from '../helpers/touchable'

import styles from './fader.scss'

const { x, track, button } = styles

const trackHeight = 180 // !! also in fader.scss !!

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
  const [rawValue, setRawValue] = useState(min)

  const valueToUse = touchActive.current ? rawValue : value
  const currentFraction = (valueToUse - min) / (max - min)
  const y = Math.round(trackHeight - currentFraction * trackHeight)

  return (
    <Touchable
      className={x}
      onTouch={e => {
        const offset = getTouchEventOffset(e, trackRef)
        if (!offset) {
          return
        }
        const fraction = ensureBetween(1 - offset.yFraction, 0, 1)
        const newRawValue = min + fraction * (max - min)
        const roundedValue = roundToStep(newRawValue, step)
        setRawValue(newRawValue)
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

export const Fader = memo(
  _Fader,
  // other values should not change without changing the key
  (prev, next) => prev.value === next.value && prev.label === next.label
)
