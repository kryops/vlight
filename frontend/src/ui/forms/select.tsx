import React, { useEffect } from 'react'
import { css } from 'linaria'

import { cx } from '../../util/styles'
import { useClassName } from '../../hooks/ui'
import {
  backgroundColor,
  textShade,
  baseline,
  backgroundColorLight,
} from '../styles'

export interface SelectEntry<T> {
  value: T
  label: string
}

export interface SelectProps<T = string | undefined> {
  entries: Array<SelectEntry<T> | string | undefined>
  value: T
  onChange: (value: T) => void
  className?: string
}

export const undefinedSelectEntry: SelectEntry<undefined> = {
  value: undefined,
  label: '',
}

const select = css`
  flex: 1 1 auto;
  padding: ${baseline()};
  background: ${backgroundColor};
  color: ${textShade(0)};
  border: 1px solid ${textShade(0)};
  max-width: 95vw;
`

const select_light = css`
  background: ${backgroundColorLight};
  color: ${textShade(0, true)};
  border-color: ${textShade(0, true)};
`

export function Select<T>({
  entries,
  value,
  onChange,
  className,
}: SelectProps<T>) {
  const inputClassName = useClassName(select, select_light)

  const normalizedEntries = entries.map(entry => {
    if (entry === undefined) return undefinedSelectEntry
    if (typeof entry === 'string') return { value: entry, label: entry }
    return entry
  })

  const activeIndex = normalizedEntries.findIndex(
    entry => entry.value === value
  )

  useEffect(() => {
    if (activeIndex === -1) {
      onChange(normalizedEntries[0]?.value as T)
    }
  })

  return (
    <select
      value={String(activeIndex)}
      onChange={event => {
        const newIndex = parseInt(event.target.value)
        onChange(normalizedEntries[newIndex]?.value ?? (null as any))
      }}
      className={cx(inputClassName, className)}
    >
      {normalizedEntries.map(({ label }, index) => (
        <option key={index} value={String(index)}>
          {label ?? ''}
        </option>
      ))}
    </select>
  )
}
