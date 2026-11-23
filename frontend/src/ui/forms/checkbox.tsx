import { ReactNode } from 'react'

import { Icon } from '../icons/icon'
import { iconCheckbox_checked, iconCheckbox } from '../icons'

import { useLabelId } from './label-context'

export interface CheckboxProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  inline?: boolean
  className?: string

  /** Accessible name, if the checkbox is not inside a `Label`. */
  'aria-label'?: string
}

/**
 * Checkbox input component with boolean values.
 */
export const Checkbox = ({
  value,
  onChange,
  inline,
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) => {
  const labelId = useLabelId()
  const toggle = () => onChange(!value)

  return (
    <Icon
      icon={value ? iconCheckbox_checked : iconCheckbox}
      onClick={toggle}
      role="checkbox"
      aria-checked={!!value}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelId}
      inline={inline}
      className={className}
    />
  )
}

export interface CheckboxLabelProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  /** The label, displayed next to the checkbox. */
  children: ReactNode
  title?: string
  className?: string
}

/**
 * Checkbox with a label, both of which can be clicked to toggle it.
 */
export const CheckboxLabel = ({
  value,
  onChange,
  children,
  title,
  className,
}: CheckboxLabelProps) => (
  <a
    role="checkbox"
    aria-checked={!!value}
    className={className}
    title={title}
    onClick={() => onChange(!value)}
  >
    <Icon icon={value ? iconCheckbox_checked : iconCheckbox} inline />{' '}
    {children}
  </a>
)
