import React from 'react'

import { Icon } from '../icons/icon'
import { iconCheckbox_checked, iconCheckbox } from '../icons'

export interface CheckboxProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  inline?: boolean
  className?: string
}

export function Checkbox({
  value,
  onChange,
  inline,
  className,
}: CheckboxProps) {
  return (
    <Icon
      icon={value ? iconCheckbox_checked : iconCheckbox}
      onClick={() => onChange(!value)}
      inline={inline}
      className={className}
    />
  )
}
