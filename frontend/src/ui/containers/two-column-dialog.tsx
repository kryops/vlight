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
  /** Primary content. */
  left: ReactNode

  /**
   * Secondary content.
   *
   * Displayed to the right on wide viewports if it fits, below the {@link left} content otherwise.
   */
  right?: ReactNode

  className?: string
  leftClassName?: string
  rightClassName?: string

  /**
   * Renders the left and right columns with equal width.
   *
   * Defaults to `false`.
   */
  fixed?: boolean

  /**
   * Always uses the full available width.
   *
   * Defaults to `false`.
   */
  fullWidth?: boolean

  /**
   * Tries to keep the {@link left} and {@link right} contents in a single row on wide
   * viewports, possibly making the content within scroll.
   *
   * Defaults to `false`.
   */
  preferSingleRow?: boolean
}

/**
 * Container to display 2 contents side by side if possible.
 */
export function TwoColumDialogContainer({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
  fixed = false,
  fullWidth = false,
  preferSingleRow = false,
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
