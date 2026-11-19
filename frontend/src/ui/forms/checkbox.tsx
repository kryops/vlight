import { Icon } from '../icons/icon'
import { iconCheckbox_checked, iconCheckbox } from '../icons'

export interface CheckboxProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  inline?: boolean
  className?: string
}

/**
 * Checkbox input component with boolean values.
 */
export const Checkbox = ({
  value,
  onChange,
  inline,
  className,
}: CheckboxProps) => {
  const toggle = () => onChange(!value)

  return (
    <Icon
      icon={value ? iconCheckbox_checked : iconCheckbox}
      onClick={toggle}
      inline={inline}
      className={className}
    />
  )
}
