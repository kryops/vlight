import { css } from '@linaria/core'
import { ReactNode } from 'react'

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

const container_full = css`
  width: auto;
  max-width: 100vw;
`

const container_preferSingleRow = css`
  @media (min-width: ${breakpoint}) {
    flex-wrap: nowrap;
    & > :first-child {
      flex-grow: 0;
    }
    & > :nth-child(2) {
      flex-basis: 0;
      width: 50vw;
    }
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
  fullWidth?: boolean
  preferSingleRow?: boolean
}

export function TwoColumDialogContainer({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
  fixed,
  fullWidth,
  preferSingleRow,
}: TwoColumDialogContainerProps) {
  return (
    <div
      className={cx(
        container,
        fullWidth && container_full,
        preferSingleRow && container_preferSingleRow,
        className
      )}
    >
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
