import { useState, useCallback, useEffect, useRef } from 'react'

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
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    onChangeRef.current?.(values)
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

export function useFormStateArray<
  TValues extends { [key in TName]: any[] },
  TName extends keyof TValues,
  TValue extends Unpacked<TValues[TName]>
>(formState: FormState<TValues>, name: TName) {
  const value = formState.values[name]
  return {
    value,
    add(entry: TValue) {
      formState.changeValue(name, [...value, entry] as TValues[TName])
    },
    remove(entry: TValue) {
      formState.changeValue(
        name,
        value.filter(it => it !== entry) as TValues[TName]
      )
    },
    update(oldEntry: TValue, newEntry: TValue) {
      formState.changeValue(
        name,
        value.map(it => (it === oldEntry ? newEntry : it)) as TValues[TName]
      )
    },
    overwrite(newValue: TValue[]) {
      formState.changeValue(name, newValue as TValues[TName])
    },
  }
}
