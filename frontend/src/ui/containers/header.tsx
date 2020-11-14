import { ReactNode } from 'react'
import { css } from 'linaria'

import { baseline } from '../styles'
import { flexWrap } from '../css/flex'

export interface HeaderProps {
  level?: number
  children?: ReactNode
  leftContent?: ReactNode
  rightContent?: ReactNode
}

const headline = css`
  margin-top: 0;
`

const rightContainer = css`
  flex: 1 0 auto;
  margin-bottom: 1rem;
  margin-left: ${baseline()};
  text-align: right;
`

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
