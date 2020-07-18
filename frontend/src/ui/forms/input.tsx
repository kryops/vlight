import React from 'react'
import { css } from 'linaria'

import { cx } from '../../util/styles'
import { useClassName } from '../../hooks/ui'
import {
  backgroundColor,
  textShade,
  baseline,
  backgroundColorLight,
  inputWidth,
} from '../styles'

export interface InputProps {
  type?: 'text' | 'number' | 'date' | 'time' | 'password'
  value: string
  onChange: (value: string) => void
  className?: string
}

const input = css`
  flex: 1 1 auto;
  width: ${inputWidth};
  max-width: 100%;
  padding: ${baseline()};
  background: ${backgroundColor};
  color: ${textShade(0)};
  border: 1px solid ${textShade(1)};
`

const input_light = css`
  background: ${backgroundColorLight};
  color: ${textShade(0, true)};
  border-color: ${textShade(2, true)};
`

export function Input({
  type = 'text',
  value,
  onChange,
  className,
}: InputProps) {
  const inputClassName = useClassName(input, input_light)
  return (
    <input
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      className={cx(inputClassName, className)}
    />
  )
}
