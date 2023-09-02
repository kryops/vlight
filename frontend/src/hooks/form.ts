import { useState, useCallback, useEffect, useMemo } from 'react'

import { useEvent, useShallowEqualMemo } from './performance'

export interface FormState<TValues extends object> {
  values: TValues
  changeValue<TKey extends keyof TValues>(key: TKey, value: TValues[TKey]): void
}

export interface FormStateOptions<TValues extends object> {
  onChange?: (values: TValues) => void
}

/**
 * React Hook to keep the state of a form.
 */
export function useFormState<TValues extends object>(
  initialValues: TValues,
  { onChange }: FormStateOptions<TValues> = {}
): FormState<TValues> {
  const [values, setValues] = useState(initialValues)

  const change = useEvent((values: TValues) => onChange?.(values))

  useEffect(() => {
    change(values)
  }, [change, values])

  const changeValue = useCallback(
    <TKey extends keyof TValues>(key: TKey, value: TValues[TKey]) => {
      setValues(oldValues => ({ ...oldValues, [key]: value }))
    },
    []
  )

  return useShallowEqualMemo({
    values,
    changeValue,
  })
}

/**
 * React Hook to manage array values in a form state.
 */
export function useFormStateArray<
  TValues extends { [key in TName]: any[] },
  TName extends keyof TValues,
  TValue extends Unpacked<TValues[TName]>,
>(formState: FormState<TValues>, name: TName) {
  const value = formState.values[name]
  const result = useMemo(
    () => ({
      value,
      /** Adds the entry to the end of the array. */
      add(entry: TValue) {
        formState.changeValue(name, [...value, entry] as TValues[TName])
      },
      /** Removes the entry from the array. */
      remove(entry: TValue) {
        formState.changeValue(
          name,
          value.filter(it => it !== entry) as TValues[TName]
        )
      },
      /** Replaces the old entry with the new one. */
      update(oldEntry: TValue, newEntry: TValue) {
        formState.changeValue(
          name,
          value.map(it => (it === oldEntry ? newEntry : it)) as TValues[TName]
        )
      },
      /** Overwrites the complete array, e.g. when changing the order of entries. */
      overwrite(newValue: TValue[]) {
        formState.changeValue(name, newValue as TValues[TName])
      },
    }),
    [formState, value, name]
  )
  return result
}
