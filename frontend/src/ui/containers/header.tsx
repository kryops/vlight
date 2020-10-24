import { ReactNode } from 'react'
import { css } from 'linaria'

import { baseline } from '../styles'

export interface HeaderProps {
  children?: ReactNode
  leftContent?: ReactNode
  rightContent?: ReactNode
}

const container = css`
  display: flex;
  flex-wrap: wrap;
`

const rightContainer = css`
  flex: 1 0 auto;
  margin-bottom: 1rem;
  margin-left: ${baseline()};
  text-align: right;
`

export function Header({ children, leftContent, rightContent }: HeaderProps) {
  return (
    <div className={container}>
      {leftContent}
      <h1>{children}</h1>
      {rightContent && <div className={rightContainer}>{rightContent}</div>}
    </div>
  )
}
