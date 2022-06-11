import { css } from '@linaria/core'
import { ReactNode } from 'react'

import { baseline } from '../styles'
import { flexEndSpacer, flexWrap } from '../css/flex'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'

const grid = css`
  display: flex;
  justify-content: stretch;

  /* to allow scrolling */
  margin-right: ${baseline(4)};

  @media (max-width: 768px) {
    display: block;
  }
`

const gridCell = css`
  justify-content: stretch;

  ${flexEndSpacer}
`

export interface GridCell {
  factor?: number
  children: ReactNode
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
        {headline && <h2>{headline}</h2>}
        <div className={cx(grid, className)}>
          {cells.map(({ factor, children, className }, index) => (
            <div
              key={index}
              className={cx(flexWrap, gridCell, className)}
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
