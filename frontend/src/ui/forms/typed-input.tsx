import React from 'react'

import { Input, InputProps } from './input'

export interface TypedInputProps<T>
  extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: T | undefined
  onChange: (value: T | undefined) => void
}

export function TextInput({
  value,
  onChange,
  ...rest
}: TypedInputProps<string>) {
  return (
    <Input
      value={value ?? ''}
      onChange={newValue => onChange(newValue === '' ? undefined : newValue)}
      {...rest}
    />
  )
}

export function NumberInput({
  value,
  onChange,
  ...rest
}: TypedInputProps<number>) {
  return (
    <Input
      type="number"
      value={String(value ?? '')}
      onChange={newValue => {
        onChange(newValue === '' ? undefined : parseFloat(newValue))
      }}
      {...rest}
    />
  )
}
