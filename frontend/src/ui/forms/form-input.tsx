import React from 'react'

import { FormState } from '../../hooks/form'

import { TextInput, TypedInputProps, NumberInput } from './typed-input'
import { Checkbox } from './checkbox'
import { Select, SelectProps } from './select'

export interface FormInputProps<
  TValue,
  TValues extends { [key in TName]?: TValue | undefined },
  TName extends keyof TValues
> {
  name: TName
  formState: FormState<TValues>
}

function wrapTypedInput<TValue>(
  TypedInput: React.ComponentType<TypedInputProps<TValue>>
) {
  return function FormInput<
    TValues extends { [key in TName]?: TValue | undefined },
    TName extends keyof TValues
  >({
    formState,
    name,
    ...rest
  }: FormInputProps<TValue, TValues, TName> &
    Omit<TypedInputProps<TValue>, 'value' | 'onChange'>) {
    return (
      <TypedInput
        value={formState.values[name]}
        onChange={value => formState.changeValue(name, value as any)}
        {...rest}
      />
    )
  }
}

export const FormTextInput = wrapTypedInput(TextInput)
export const FormNumberInput = wrapTypedInput(NumberInput)
export const FormCheckbox = wrapTypedInput(Checkbox)

export function FormSelect<
  TValue,
  TValues extends { [key in TName]?: TValue | undefined },
  TName extends keyof TValues
>({
  formState,
  name,
  entries,
  ...rest
}: FormInputProps<TValue, TValues, TName> &
  Omit<SelectProps<TValue>, 'value' | 'onChange'>) {
  return (
    <Select
      entries={entries}
      value={formState.values[name] as any}
      onChange={value => formState.changeValue(name, value as any)}
      {...rest}
    />
  )
}
