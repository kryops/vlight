import { css } from '@linaria/core'
import { ensureBetween, valueToFraction } from '@vlight/utils'

import { baseline, iconShade, primaryShade, textShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'

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
  font-size: 0.65rem;
  color: ${textShade(0)};
  z-index: 2;
`

const barTopCornerLabel = css`
  top: ${baseline(0.5)};
  right: ${baseline(1)};
`

const barBottomCornerLabel = css`
  bottom: ${baseline(0.5)};
  left: ${baseline(1)};
`

const barBottomCornerLabel_overflow = css`
  min-width: ${baseline(32)};
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
  topCornerLabel?: string
  bottomCornerLabel?: string
  bottomCornerLabelOverflow?: boolean
  color?: string
  className?: string
}

export const Bar = memoInProduction(
  ({
    label,
    topCornerLabel,
    bottomCornerLabel,
    bottomCornerLabelOverflow,
    value,
    min = 0,
    max = 1,
    color,
    className,
  }: BarProps) => {
    const fraction = ensureBetween(valueToFraction(value, min, max), 0, 1)
    return (
      <div
        className={cx(bar, className)}
        style={color ? { borderBottomColor: color } : undefined}
      >
        <div className={barLabel}>{label}</div>
        {topCornerLabel && (
          <div className={cx(barCornerLabel, barTopCornerLabel)}>
            {topCornerLabel}
          </div>
        )}
        {bottomCornerLabel && (
          <div
            className={cx(
              barCornerLabel,
              barBottomCornerLabel,
              bottomCornerLabelOverflow && barBottomCornerLabel_overflow
            )}
          >
            {bottomCornerLabel}
          </div>
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
