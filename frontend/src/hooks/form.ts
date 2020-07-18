import { useState, useCallback } from 'react'

export interface FormState<TValues extends object> {
  values: TValues
  changeValue<TKey extends keyof TValues>(key: TKey, value: TValues[TKey]): void
}

export function useFormState<TValues extends object>(
  initialValues: TValues
): FormState<TValues> {
  const [values, setValues] = useState(initialValues)

  const changeValue = useCallback(
    <TKey extends keyof TValues>(key: TKey, value: TValues[TKey]) => {
      setValues(oldValues => ({ ...oldValues, [key]: value }))
    },
    []
  )

  return {
    values,
    changeValue,
  }
}
