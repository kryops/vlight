import { css } from 'linaria'
import React, { ReactNode } from 'react'

import { cx } from '../../util/styles'
import { baseline } from '../styles'

const breakpoint = '700px'

const container = css`
  margin-bottom: ${baseline(-6)};

  @media (min-width: ${breakpoint}) {
    width: 80vw;
    max-width: 1200px;
    display: flex;
    flex-wrap: wrap;
  }
`

const column = css`
  flex: 1 1 auto;

  margin-bottom: ${baseline(6)};

  @media (min-width: ${breakpoint}) {
    margin-right: ${baseline(4)};
  }

  &:last-child {
    margin-right: 0;
  }
`

const column_fixed = css`
  flex-basis: 0;
`

export interface TwoColumDialogContainerProps {
  left: ReactNode
  right?: ReactNode
  className?: string
  leftClassName?: string
  rightClassName?: string
  fixed?: boolean
}

export function TwoColumDialogContainer({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
  fixed,
}: TwoColumDialogContainerProps) {
  return (
    <div className={cx(container, className)}>
      <div className={cx(column, fixed && column_fixed, leftClassName)}>
        {left}
      </div>
      {right && (
        <div className={cx(column, fixed && column_fixed, rightClassName)}>
          {right}
        </div>
      )}
    </div>
  )
}
