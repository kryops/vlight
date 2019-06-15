import cx from 'classnames'
import { css } from 'linaria'
import React from 'react'

import { ensureBetween, getFraction } from '../../util/number'
import {
  baselinePx,
  iconShade,
  primaryShade,
  fontSizePx,
  textShade,
} from '../styles'
import { memoInProduction } from '../../util/development'

const bar = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${iconShade(2)};
  padding: ${baselinePx * 2}px;
`

const barLabel = css`
  z-index: 2;
`

const barCornerLabel = css`
  position: absolute;
  left: ${baselinePx}px;
  bottom: ${baselinePx / 2}px;
  font-size: ${fontSizePx * 0.65}px;
  color: ${textShade(0)};
  z-index: 2;
`

const barLevel = css`
  background: ${primaryShade(0)};
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform-origin: bottom center;
`

export interface Props {
  value: number
  min?: number
  max?: number
  label?: string
  cornerLabel?: string
  color?: string
  className?: string
}

const _Bar: React.SFC<Props> = ({
  label,
  cornerLabel,
  value,
  min = 0,
  max = 1,
  color,
  className,
}) => {
  const fraction = ensureBetween(getFraction(value, min, max), 0, 1)
  return (
    <div
      className={cx(bar, className)}
      style={color ? { borderBottomColor: color } : undefined}
    >
      <div className={barLabel}>{label}</div>
      {cornerLabel && <div className={barCornerLabel}>{cornerLabel}</div>}
      {fraction > 0 && (
        <div
          className={barLevel}
          style={
            fraction < 1
              ? {
                  opacity: 0.3 + fraction * 0.7,
                  transform: `scaleY(${fraction})`,
                }
              : undefined
          }
        />
      )}
    </div>
  )
}

export const Bar = memoInProduction(_Bar)
