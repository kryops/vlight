import React from 'react'
import cx from 'classnames'
import { css } from 'linaria'

import { baselinePx } from '../styles'
import { flexEndSpacer } from '../css/flex-end-spacer'
import { memoInProduction } from '../../util/development'

export interface GridCell {
  factor?: number
  children: React.ReactNode
  className?: string
}

export interface Props {
  headline?: string
  cells: GridCell[]
  className?: string
}

const grid = css`
  display: flex;
  justify-content: stretch;

  /* to allow scrolling */
  margin-right: ${baselinePx * 8}px;

  @media (max-width: 768px) {
    display: block;
  }
`

const gridCell = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;

  ${flexEndSpacer}
`

const _Grid: React.SFC<Props> = ({ headline, cells, className }) => {
  const factorSum = cells.reduce((sum, { factor }) => sum + (factor || 1), 0)
  return (
    <>
      {headline && <h3>{headline}</h3>}
      <div className={cx(grid, className)}>
        {cells.map(({ factor, children, className }, index) => (
          <div
            key={index}
            className={cx(gridCell, className)}
            style={{ flexBasis: ((factor || 1) / factorSum) * 100 + '%' }}
          >
            {children}
          </div>
        ))}
      </div>
    </>
  )
}

export const Grid = memoInProduction(_Grid)
