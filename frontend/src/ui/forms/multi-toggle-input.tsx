import { ReactNode } from 'react'
import { css } from '@linaria/core'

import { cx } from '../../util/styles'
import { baseline } from '../styles'
import { Button } from '../buttons/button'

export interface MultiToggleInputProps<T> {
  value: Array<T>
  entries: T[]
  onChange: (value: Array<T>) => void

  /**
   * Function to provide the value to display for each entry.
   *
   * Defaults to the value's string representation.
   */
  getDisplayValue?: (value: T) => ReactNode

  className?: string

  /** CSS class name to be applied to the container for each entry. */
  entryClassName?: string
}

const container = css`
  margin-top: ${baseline()};
  max-height: ${baseline(84)};
  overflow-y: auto;
`

const entryStyle = css`
  margin-top: 0;
  margin-bottom: ${baseline()};
  text-align: left;
  width: auto;
`

/**
 * Input component to toggle multiple entries of the same type.
 */
export function MultiToggleInput<T>({
  value,
  entries,
  onChange,
  getDisplayValue,
  className,
  entryClassName,
}: MultiToggleInputProps<T>) {
  return (
    <div className={cx(container, className)}>
      {entries.map((entry, index) => (
        <Button
          key={typeof entry === 'string' ? entry : index}
          className={cx(entryStyle, entryClassName)}
          active={value.includes(entry)}
          block
          onClick={() =>
            onChange(
              value.includes(entry)
                ? value.filter(it => it !== entry)
                : [...value, entry]
            )
          }
        >
          {getDisplayValue?.(entry) ?? String(entry)}
        </Button>
      ))}
    </div>
  )
}
