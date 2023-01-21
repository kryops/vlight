import { useEffect, useMemo } from 'react'
import { css } from '@linaria/core'

import { cx } from '../../util/styles'
import { backgroundColor, textShade, baseline } from '../styles'
import { memoInProduction } from '../../util/development'

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
  border: 1px solid ${textShade(1)};
  max-width: 95vw;
`

/**
 * Select input wrapper.
 *
 * Works with simple string values, or entries that have a separate label.
 */
export const Select = memoInProduction(
  <T extends any>({ entries, value, onChange, className }: SelectProps<T>) => {
    const normalizedEntries = useMemo(
      () =>
        entries.map(entry => {
          if (entry === undefined) return undefinedSelectEntry
          if (typeof entry === 'string') return { value: entry, label: entry }
          return entry
        }),
      [entries]
    )

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
          onChange(normalizedEntries[newIndex]?.value as T)
        }}
        className={cx(select, className)}
      >
        {normalizedEntries.map(({ label }, index) => (
          <option key={index} value={String(index)}>
            {label ?? ''}
          </option>
        ))}
      </select>
    )
  }
)
