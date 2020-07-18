import React from 'react'
import { css } from 'linaria'

import { baseline, primaryShade, textShade } from '../styles'
import { cx } from '../../util/styles'
import { useClassName } from '../../hooks/ui'

export interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  block?: boolean
  className?: string
}

const button = css`
  padding: ${baseline(2)} ${baseline(4)};
  background: ${primaryShade(2)};
  color: ${textShade(0)};
  border: none;
  border-radius: ${baseline()};
  text-align: center;
  cursor: pointer;

  &:hover {
    background: ${primaryShade(1)};
  }

  &:active,
  &:focus {
    outline: none;
  }

  &:active {
    background: ${primaryShade(0)};
  }
`

const button_light = css`
  background: ${primaryShade(3, true)};
  color: ${textShade(0, true)};

  &:hover {
    background: ${primaryShade(2, true)};
  }

  &:active {
    background: ${primaryShade(1, true)};
  }
`

const buttonBlock = css`
  display: block;
  width: 100%;
  margin: ${baseline(1)} 0;
`

export function Button({ children, onClick, block, className }: ButtonProps) {
  const buttonClass = useClassName(button, button_light)
  return (
    <button
      className={cx(buttonClass, block && buttonBlock, className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
