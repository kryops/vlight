import React from 'react'

import { Icon } from '../icons/icon'
import { iconCheckbox_checked, iconCheckbox } from '../icons'

export interface CheckboxProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  className?: string
}

export function Checkbox({ value, onChange, className }: CheckboxProps) {
  return (
    <Icon
      icon={value ? iconCheckbox_checked : iconCheckbox}
      onClick={() => onChange(!value)}
      inline
      className={className}
    />
  )
}
