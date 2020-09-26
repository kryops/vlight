import React, { ReactNode } from 'react'
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
  margin-bottom: 1rem;
`

const h1 = css`
  margin-bottom: 0;
`

const rightContainer = css`
  flex: 1 0 auto;
  text-align: right;
  margin-left: ${baseline()};
`

export function Header({ children, leftContent, rightContent }: HeaderProps) {
  return (
    <div className={container}>
      {leftContent}
      <h1 className={h1}>{children}</h1>
      {rightContent && <div className={rightContainer}>{rightContent}</div>}
    </div>
  )
}
