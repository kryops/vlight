import React from 'react'
import { css } from 'linaria'

import { baseline } from '../styles'
import { flexEndSpacer } from '../css/flex-end-spacer'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'

const grid = css`
  display: flex;
  justify-content: stretch;

  /* to allow scrolling */
  margin-right: ${baseline(8)};

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

export interface GridCell {
  factor?: number
  children: React.ReactNode
  className?: string
}

export interface GridProps {
  headline?: string
  cells: GridCell[]
  className?: string
}

export const Grid = memoInProduction(
  ({ headline, cells, className }: GridProps) => {
    const factorSum = cells.reduce((sum, { factor }) => sum + (factor ?? 1), 0)
    return (
      <>
        {headline && <h3>{headline}</h3>}
        <div className={cx(grid, className)}>
          {cells.map(({ factor, children, className }, index) => (
            <div
              key={index}
              className={cx(gridCell, className)}
              style={{ flexBasis: ((factor ?? 1) / factorSum) * 100 + '%' }}
            >
              {children}
            </div>
          ))}
        </div>
      </>
    )
  }
)
