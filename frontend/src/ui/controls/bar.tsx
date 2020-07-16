import { css } from 'linaria'
import React from 'react'

import { ensureBetween, getFraction } from '../../util/shared'
import { baseline, iconShade, primaryShade, textShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { useClassName } from '../../hooks/ui'

const bar = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${iconShade(2)};
  padding: ${baseline(2)};
`

const barLabel = css`
  z-index: 2;
`

const barCornerLabel = css`
  position: absolute;
  left: ${baseline(1)};
  bottom: ${baseline(0.5)};
  font-size: 0.65rem;
  color: ${textShade(0)};
  z-index: 2;
`

const barCornerLabel_light = css`
  color: ${textShade(0, true)};
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

export interface BarProps {
  value: number
  min?: number
  max?: number
  label?: string
  cornerLabel?: string
  color?: string
  className?: string
}

export const Bar = memoInProduction(
  ({
    label,
    cornerLabel,
    value,
    min = 0,
    max = 1,
    color,
    className,
  }: BarProps) => {
    const cornerLabelClassName = useClassName(
      barCornerLabel,
      barCornerLabel_light
    )
    const fraction = ensureBetween(getFraction(value, min, max), 0, 1)
    return (
      <div
        className={cx(bar, className)}
        style={color ? { borderBottomColor: color } : undefined}
      >
        <div className={barLabel}>{label}</div>
        {cornerLabel && (
          <div className={cornerLabelClassName}>{cornerLabel}</div>
        )}
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
)
