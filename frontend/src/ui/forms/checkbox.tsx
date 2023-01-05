import { Icon } from '../icons/icon'
import { iconCheckbox_checked, iconCheckbox } from '../icons'
import { useEvent } from '../../hooks/performance'

export interface CheckboxProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  inline?: boolean
  className?: string
}

/**
 * Checkbox input component with boolean values.
 */
export function Checkbox({
  value,
  onChange,
  inline,
  className,
}: CheckboxProps) {
  const toggle = useEvent(() => onChange(!value))

  return (
    <Icon
      icon={value ? iconCheckbox_checked : iconCheckbox}
      onClick={toggle}
      inline={inline}
      className={className}
    />
  )
}
