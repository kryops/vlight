import { css } from 'linaria'
import React, { memo } from 'react'

import { baselinePx, primaryShade } from '../styles'

const bar = css`
  border: 1px solid ${primaryShade(1)};
`

const barLabel = css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${baselinePx * 2}px;
`

export interface Props {
  value: number
  min?: number
  max?: number
  label?: string
}

const _Bar: React.SFC<Props> = ({ value }) => (
  <div className={bar}>
    <div className={barLabel}>{value}</div>
  </div>
)

export const Bar = memo(_Bar)
