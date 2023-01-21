import { useMemo, useRef, useState } from 'react'
import { css } from '@linaria/core'
import { toArray } from '@vlight/utils'

import { iconDelete } from '../icons'
import { cx } from '../../util/styles'
import { baseline } from '../styles'
import { flexAuto } from '../css/flex'
import { Button } from '../buttons/button'
import { memoInProduction } from '../../util/development'

import { TypedInputProps } from './typed-input'

export interface ArrayInputProps<T> {
  value: T | undefined | Array<T | undefined>
  onChange: (value: Array<T>) => void

  /** Renders the input component for a single item. */
  renderInput: (props: TypedInputProps<T>) => JSX.Element

  /**
   * Controls whether to allow removing array entries.
   *
   * Defaults to `false`.
   */
  displayRemoveButtons?: boolean

  className?: string

  /** CSS class name to apply to the container for each entry. */
  entryClassName?: string
}

const entry = css`
  display: flex;
  margin: ${baseline(2)} 0;
  align-items: center;
`

function removeTrailingUndefined<T extends any[]>(arr: T): T {
  if (!arr.length || arr[arr.length - 1] !== undefined) return arr

  const newArr = arr.slice(0, -1) as T
  while (newArr.length && newArr[newArr.length - 1] === undefined) {
    newArr.pop()
  }

  return newArr
}

function removeUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(it => it !== undefined) as T[]
}

/**
 * Input wrapper component to edit arrays.
 *
 * Always renders an empty/undefined input element at the end
 * to add new values to the array.
 */
export const ArrayInput = memoInProduction(
  <T extends any>({
    value,
    onChange,
    renderInput,
    displayRemoveButtons = false,
    className,
    entryClassName,
  }: ArrayInputProps<T>) => {
    const sanitizedValue = useMemo(
      () => (value === undefined ? [] : toArray(value)),
      [value]
    )
    const outgoingValueRef = useRef(sanitizedValue)
    const [valueToUse, setValueToUse] = useState(
      removeTrailingUndefined(sanitizedValue)
    )

    if (outgoingValueRef.current !== sanitizedValue) {
      outgoingValueRef.current = sanitizedValue
      setValueToUse(sanitizedValue)
    }

    function onChangeInternal(value: (T | undefined)[]) {
      const valueToSend = removeUndefined(value)
      outgoingValueRef.current = valueToSend
      onChange(valueToSend)
      setValueToUse(removeTrailingUndefined(value))
    }

    const toRender = useMemo(() => [...valueToUse, undefined], [valueToUse])

    return (
      <div className={cx(flexAuto, className)}>
        {toRender.map((singleValue, index) => {
          const changeSingleValue = (newSingleValue: T | undefined) => {
            if (newSingleValue !== undefined && index === valueToUse.length) {
              onChangeInternal([...sanitizedValue, newSingleValue])
            } else {
              const newValue = [...valueToUse]
              newValue[index] = newSingleValue
              onChangeInternal(newValue)
            }
          }

          return (
            <div key={index} className={cx(entry, entryClassName)}>
              {renderInput({ value: singleValue, onChange: changeSingleValue })}
              {displayRemoveButtons && singleValue !== undefined && (
                <Button
                  icon={iconDelete}
                  onClick={() => changeSingleValue(undefined)}
                  transparent
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }
)
