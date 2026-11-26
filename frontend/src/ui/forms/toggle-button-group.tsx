import { css } from '@linaria/core'

import { Button } from '../buttons/button'
import { baseline } from '../styles'
import { cx } from '../../util/styles'

import { useLabelId } from './label-context'

export interface ToggleButtonGroupEntry<T> {
  value: T
  label: string

  /** Icon to display next to the label. */
  icon?: string

  /** Tooltip to display. */
  title?: string
}

export interface ToggleButtonGroupProps<T> {
  value: T
  entries: ToggleButtonGroupEntry<T>[]
  onChange: (value: T) => void
  className?: string
}

const container = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${baseline()};
`

const entryStyle = css`
  margin-left: 0;
  padding: ${baseline(1.5)} ${baseline(2)};
`

/**
 * Row of buttons to select exactly one of multiple entries.
 *
 * Optimized for quick switching on touch devices,
 * so it should only be used for few entries with short labels.
 */
export const ToggleButtonGroup = <T extends any>({
  value,
  entries,
  onChange,
  className,
}: ToggleButtonGroupProps<T>) => {
  const labelId = useLabelId()

  return (
    <div
      className={cx(container, className)}
      role="group"
      aria-labelledby={labelId}
    >
      {entries.map(entry => (
        <Button<T>
          key={String(entry.value)}
          className={entryStyle}
          icon={entry.icon}
          title={entry.title}
          active={entry.value === value ? true : undefined}
          onClick={(_event, newValue) => onChange(newValue)}
          onClickArg={entry.value}
        >
          {entry.label}
        </Button>
      ))}
    </div>
  )
}
