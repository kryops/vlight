import { css } from 'linaria'
import { ReactNode } from 'react'

import { baseline, primaryShade, textShade } from '../styles'
import { cx } from '../../util/styles'
import { Touchable } from '../components/touchable'
import { Icon } from '../icons/icon'

const button = css`
  display: inline-block;
  padding: ${baseline(2)} ${baseline(3)};
  background: ${primaryShade(2)};
  margin-left: ${baseline()};
  color: ${textShade(0)};
  border: none;
  text-align: center;
  cursor: pointer;

  &:hover,
  &:active {
    background: ${primaryShade(1)};
  }

  &:active,
  &:focus {
    outline: none;
  }
`

const button_active = css`
  background: ${primaryShade(1)};
`

const button_inactive = css`
  &:active,
  &:hover,
  &:focus {
    background: ${primaryShade(2)};
  }
`

const button_disabled = css`
  opacity: 0.6;
`

const buttonBlock = css`
  display: block;
  width: 100%;
  margin: ${baseline()} 0;
`

const iconStyle = css`
  margin-right: ${baseline()};
`

export interface ButtonProps {
  children?: ReactNode
  onDown?: () => void
  onUp?: () => void
  icon?: string
  block?: boolean
  active?: boolean
  disabled?: boolean
  className?: string
  title?: string
}

export function Button({
  children,
  onDown,
  onUp,
  block,
  icon,
  active,
  disabled,
  className,
  title,
}: ButtonProps) {
  return (
    <Touchable
      className={cx(
        button,
        block && buttonBlock,
        active === true && button_active,
        (active === false || disabled) && button_inactive,
        disabled && button_disabled,
        className
      )}
      title={title}
      onDown={onDown}
      onUp={onUp}
    >
      {icon && <Icon icon={icon} inline className={iconStyle} shade={1} />}
      {children}
    </Touchable>
  )
}
