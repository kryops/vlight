import { useState } from 'react'

import { Input, InputProps } from './input'

export interface TypedInputProps<T> extends Omit<InputProps, 'value'> {
  value: T | undefined
  onChange: (value: T | undefined) => void
  className?: string
}

export const TextInput = ({
  value,
  onChange,
  ...rest
}: TypedInputProps<string>) => {
  return (
    <Input
      value={value ?? ''}
      onChange={newValue => onChange(newValue === '' ? undefined : newValue)}
      {...rest}
    />
  )
}

export interface NumberInputProps extends TypedInputProps<number> {
  min?: number
  max?: number
}

export const NumberInput = ({ value, onChange, ...rest }: NumberInputProps) => {
  // To allow undefined here even if it is not applied from above
  const [internalValue, setInternalValue] = useState(value)

  // apply changes from above
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setInternalValue(value)
  }

  const onChangeInternal = (newValue: string) => {
    const rawNumberValue = newValue === '' ? undefined : parseFloat(newValue)
    const numberValue =
      rest.step && Number(rest.step) === 1
        ? rawNumberValue && Math.floor(rawNumberValue)
        : rawNumberValue

    setInternalValue(numberValue)
    onChange(numberValue)
  }

  return (
    <Input
      type="number"
      value={String(internalValue ?? '')}
      onChange={onChangeInternal}
      {...rest}
    />
  )
}
