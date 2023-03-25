import { css } from '@linaria/core'
import { fractionToValue } from '@vlight/utils'
import { useRef } from 'react'

import { useDelayedState } from '../../../hooks/delayed-state'
import { useShallowEqualMemo } from '../../../hooks/performance'
import { memoInProduction } from '../../../util/development'
import { getFractionWithMargin, getTouchEventOffset } from '../../../util/touch'
import { Touchable } from '../../components/touchable'
import {
  backgroundColor,
  baseline,
  baselinePx,
  iconShade,
  primaryShade,
} from '../../styles'

import type { Position } from './utils'

const positionPickerWidth = baselinePx * 54
const positionMarkerSize = baselinePx * 5

const positionPicker = css`
  position: relative;
  width: ${positionPickerWidth}px;
  margin: ${baseline(1.5)};
  flex: 0 0 auto;
  border: 2px solid ${iconShade(2)};
  background: ${backgroundColor};
`

const markerContainer = css`
  position: absolute;
  top: ${positionMarkerSize / 2}px;
  right: ${positionMarkerSize / 2}px;
  bottom: ${positionMarkerSize / 2}px;
  left: ${positionMarkerSize / 2}px;
`

const positionMarker = css`
  position: absolute;
  width: ${positionMarkerSize}px;
  height: ${positionMarkerSize}px;
  margin: -${positionMarkerSize / 2}px;
  background: ${primaryShade(0)};
  border-radius: 100%;
`

export interface PositionPickerProps {
  pan?: number
  tilt?: number
  onChange: (position: Position) => void
}

export const PositionPicker = memoInProduction(
  ({ pan = 0, tilt = 0, onChange }: PositionPickerProps) => {
    const [localPosition, setLocalPosition] = useDelayedState<Position | null>(
      null
    )
    const touchRef = useRef<HTMLDivElement>(null)

    const currentPosition: Position = localPosition ?? { pan, tilt }

    const lastPositionRef = useRef<Position>(currentPosition)

    const markerStyle = useShallowEqualMemo({
      top: `${((255 - currentPosition.tilt) / 255) * 100}%`,
      left: `${(currentPosition.pan / 255) * 100}%`,
    })

    return (
      <Touchable
        ref={touchRef}
        className={positionPicker}
        onTouch={event => {
          const offset = getTouchEventOffset(event, touchRef)
          if (!offset) {
            return
          }
          const { x, y } = getFractionWithMargin(offset, positionMarkerSize / 2)
          const toValue = (fraction: number) =>
            Math.round(fractionToValue(fraction, 0, 255))
          const newPosition: Position = {
            pan: toValue(x),
            tilt: toValue(1 - y),
          }

          if (
            lastPositionRef.current.pan === newPosition.pan &&
            lastPositionRef.current.tilt === newPosition.tilt
          ) {
            return
          }
          lastPositionRef.current = newPosition
          setLocalPosition(newPosition)
          onChange(newPosition)
        }}
        onUp={() => setLocalPosition(null, true)}
        preventScroll
      >
        <div className={markerContainer}>
          <div className={positionMarker} style={markerStyle} />
        </div>
      </Touchable>
    )
  }
)
