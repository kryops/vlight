import { css } from '@linaria/core'
import { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react'

import { cx } from '../../util/styles'
import { backgroundColor, textShade, baseline, inputWidth } from '../styles'

import { useLabelId } from './label-context'

export interface InputProps extends InputHTMLAttributes<any> {
  type?: 'text' | 'number' | 'date' | 'time' | 'password'
  value: string
  onChange: (value: any) => void
  className?: string
  ref?: Ref<HTMLInputElement>
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

/**
 * Wrapper around HTML input to provide custom styling.
 */
export const Input = ({
  type = 'text',
  value,
  onChange,
  className,
  ...rest
}: InputProps) => {
  const labelId = useLabelId()

  return (
    <input
      aria-labelledby={rest['aria-label'] ? undefined : labelId}
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      className={cx(input, className)}
      {...rest}
    />
  )
}

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange'
> {
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Wrapper around HTML textarea to provide custom styling.
 */
export const TextArea = ({
  value,
  onChange,
  className,
  ...rest
}: TextAreaProps) => {
  const labelId = useLabelId()

  return (
    <textarea
      aria-labelledby={rest['aria-label'] ? undefined : labelId}
      value={value}
      onChange={event => onChange(event.target.value)}
      className={cx(input, className)}
      {...rest}
    />
  )
}
