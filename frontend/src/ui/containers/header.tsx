import { ReactNode } from 'react'
import { css } from '@linaria/core'

import { baseline } from '../styles'
import { flexWrap } from '../css/flex'

export interface HeaderProps {
  /**
   * HTML headline level.
   *
   * Defaults to 1.
   */
  level?: number

  children?: ReactNode

  /**
   * Content to the left of the {@link children}.
   */
  leftContent?: ReactNode

  /**
   * Content to the right of the {@link children}, aligned right.
   */
  rightContent?: ReactNode
}

const headline = css`
  margin-top: 0;
`

const rightContainer = css`
  flex: 1 0 auto;
  margin-bottom: ${baseline(2)};
  margin-left: ${baseline()};
  text-align: right;
`

/**
 * Header / headline component.
 */
export function Header({
  level = 1,
  children,
  leftContent,
  rightContent,
}: HeaderProps) {
  const Headline = `h${level}` as any
  return (
    <div className={flexWrap}>
      {leftContent}
      <Headline className={headline}>{children}</Headline>
      {rightContent && <div className={rightContainer}>{rightContent}</div>}
    </div>
  )
}
