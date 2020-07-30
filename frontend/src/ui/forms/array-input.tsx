import React, { useRef, useState } from 'react'
import { css } from 'linaria'

import { Icon } from '../icons/icon'
import { iconDelete } from '../icons'
import { cx } from '../../util/styles'
import { baseline } from '../styles'

import { TypedInputProps } from './typed-input'

export interface ArrayInputProps<T> {
  value: Array<T | undefined>
  onChange: (value: Array<T>) => void
  Input: React.ComponentType<TypedInputProps<T>>
  displayRemoveButtons?: boolean
  className?: string
  entryClassName?: string
}

const container = css`
  flex: 1 1 auto;
`

const entry = css`
  display: flex;
  margin: ${baseline(2)} 0;
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

export function ArrayInput<T>({
  value,
  onChange,
  Input,
  displayRemoveButtons,
  className,
  entryClassName,
}: ArrayInputProps<T>) {
  const outgoingValueRef = useRef(value)
  const [valueToUse, setValueToUse] = useState(removeTrailingUndefined(value))

  if (outgoingValueRef.current !== value) {
    outgoingValueRef.current = value
    setValueToUse(value)
  }

  function onChangeInternal(value: (T | undefined)[]) {
    const valueToSend = removeUndefined(value)
    outgoingValueRef.current = valueToSend
    onChange(valueToSend)
    setValueToUse(removeTrailingUndefined(value))
  }

  const toRender = [...valueToUse, undefined]

  return (
    <div className={cx(container, className)}>
      {toRender.map((singleValue, index) => {
        const changeSingleValue = (newSingleValue: T | undefined) => {
          if (newSingleValue !== undefined && index === valueToUse.length) {
            onChangeInternal([...value, newSingleValue])
          } else {
            const newValue = [...valueToUse]
            newValue[index] = newSingleValue
            onChangeInternal(newValue)
          }
        }

        return (
          <div key={index} className={cx(entry, entryClassName)}>
            <Input value={singleValue} onChange={changeSingleValue} />
            {displayRemoveButtons && singleValue !== undefined && (
              <Icon
                icon={iconDelete}
                onClick={() => changeSingleValue(undefined)}
                hoverable
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
