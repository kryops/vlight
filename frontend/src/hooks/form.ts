import { useState, useCallback, useEffect } from 'react'

import { useCurrentRef } from './ref'

export interface FormState<TValues extends object> {
  values: TValues
  changeValue<TKey extends keyof TValues>(key: TKey, value: TValues[TKey]): void
}

export interface FormStateOptions<TValues extends object> {
  onChange?: (values: TValues) => void
}

export function useFormState<TValues extends object>(
  initialValues: TValues,
  { onChange }: FormStateOptions<TValues> = {}
): FormState<TValues> {
  const [values, setValues] = useState(initialValues)
  const onChangeRef = useCurrentRef(onChange)
  useEffect(() => {
    onChangeRef.current?.(values)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

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
