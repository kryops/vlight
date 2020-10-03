import React from 'react'
import { IdType } from '@vlight/types'

import { FormState } from '../../hooks/form'

import { TextInput, TypedInputProps, NumberInput } from './typed-input'
import { Checkbox } from './checkbox'
import { Select, SelectProps } from './select'
import {
  EntityReferenceSelectProps,
  EntityReferenceSelect,
} from './entity-reference-select'
import { ArrayInput, ArrayInputProps } from './array-input'

export interface FormInputProps<
  TValue,
  TValues extends { [key in TName]?: TValue | undefined },
  TName extends keyof TValues
> {
  name: TName
  formState: FormState<TValues>
}

function wrapTypedInput<TValue, TAdditionalProps extends object>(
  TypedInput: React.ComponentType<TypedInputProps<TValue> & TAdditionalProps>
) {
  return function FormInput<
    TValues extends { [key in TName]?: TValue | undefined },
    TName extends keyof TValues
  >({
    formState,
    name,
    ...rest
  }: FormInputProps<TValue, TValues, TName> &
    Omit<TypedInputProps<TValue>, 'value' | 'onChange'> &
    Omit<TAdditionalProps, 'value' | 'onChange'>) {
    return (
      <TypedInput
        value={formState.values[name]}
        onChange={value => formState.changeValue(name, value as any)}
        {...(rest as any)}
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

export function FormEntityReferenceSelect<
  TValues extends { [key in TName]: IdType },
  TName extends keyof TValues
>({
  formState,
  name,
  entity,
  ...rest
}: FormInputProps<IdType, TValues, TName> &
  Omit<EntityReferenceSelectProps, 'value' | 'onChange'>) {
  return (
    <EntityReferenceSelect
      entity={entity}
      value={formState.values[name] as any}
      onChange={value => formState.changeValue(name, value as any)}
      {...rest}
    />
  )
}

export function FormArrayInput<
  TValue,
  TValues extends { [key in TName]: TValue[] },
  TName extends keyof TValues
>({
  formState,
  name,
  ...rest
}: FormInputProps<TValue[], TValues, TName> &
  Omit<ArrayInputProps<TValue>, 'value' | 'onChange'>) {
  return (
    <ArrayInput
      value={formState.values[name] as any}
      onChange={value => formState.changeValue(name, value as any)}
      {...rest}
    />
  )
}
