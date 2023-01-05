import { IdType } from '@vlight/types'
import { ComponentType } from 'react'

import { FormState } from '../../hooks/form'
import { useEvent } from '../../hooks/performance'

import { TextInput, TypedInputProps, NumberInput } from './typed-input'
import { Checkbox } from './checkbox'
import { Select, SelectProps } from './select'
import {
  EntityReferenceSelectProps,
  EntityReferenceSelect,
} from './entity-reference-select'
import { ArrayInput, ArrayInputProps } from './array-input'
import { FixtureListInput, FixtureListInputProps } from './fixture-list-input'

export interface FormInputProps<
  TValue,
  TValues extends { [key in TName]?: TValue | undefined },
  TName extends keyof TValues
> {
  name: TName
  formState: FormState<TValues>
}

function wrapTypedInput<TValue, TAdditionalProps extends object>(
  TypedInput: ComponentType<TypedInputProps<TValue> & TAdditionalProps>
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

/**
 * Wrapper around {@link TextInput} for use with a form state.
 */
export const FormTextInput = wrapTypedInput(TextInput)

/**
 * Wrapper around {@link NumberInput} for use with a form state.
 */
export const FormNumberInput = wrapTypedInput(NumberInput)

/**
 * Wrapper around {@link Checkbox} for use with a form state.
 */
export const FormCheckbox = wrapTypedInput(Checkbox)

/**
 * Wrapper around {@link Select} for use with a form state.
 */
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

/**
 * Wrapper around {@link EntityReferenceSelect} for use with a form state.
 */
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

/**
 * Wrapper around {@link ArrayInput} for use with a form state.
 */
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

/**
 * Wrapper around {@link FixtureListInput} for use with a form state.
 */
export function FormFixtureListInput<
  TValue,
  TValues extends { [key in TName]: TValue[] },
  TName extends keyof TValues
>({
  formState,
  name,
  ...rest
}: FormInputProps<TValue[], TValues, TName> &
  Omit<FixtureListInputProps, 'value' | 'onChange'>) {
  const onChange = useEvent((value: string[]) =>
    formState.changeValue(name, value as any)
  )

  return (
    <FixtureListInput
      value={formState.values[name] as any}
      onChange={onChange}
      {...rest}
    />
  )
}
