import React from 'react'
import { css } from 'linaria'

import { baseline, primaryShade, textShade } from '../styles'
import { cx } from '../../util/styles'
import { useClassNames } from '../../hooks/ui'
import { Touchable } from '../components/touchable'
import { Icon } from '../icons/icon'

export interface ButtonProps {
  children: React.ReactNode
  onDown?: () => void
  onUp?: () => void
  icon?: string
  block?: boolean
  active?: boolean
  className?: string
}

const button = css`
  display: inline-block;
  padding: ${baseline(2)} ${baseline(4)};
  background: ${primaryShade(2)};
  margin-left: ${baseline()};
  color: ${textShade(0)};
  border: none;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: ${primaryShade(1)};
  }

  &:active,
  &:focus {
    outline: none;
  }

  &:active {
    background: ${primaryShade(0)};
  }
`

const button_active = css`
  background: ${primaryShade(0)};
`

const button_inactive = css`
  &:active {
    background: ${primaryShade(2)};
  }
`

const button_light = css`
  background: ${primaryShade(3, true)};
  color: ${textShade(0, true)};

  &:hover {
    background: ${primaryShade(2, true)};
  }

  &:active {
    background: ${primaryShade(1, true)};
  }
`

const button_active_light = css`
  background: ${primaryShade(1, true)};
`

const button_inactive_light = css`
  &:active {
    background: ${primaryShade(3, true)};
  }
`

const buttonBlock = css`
  display: block;
  width: 100%;
  margin: ${baseline()} 0;
`

const iconStyle = css`
  margin-right: ${baseline()};
`

export function Button({
  children,
  onDown,
  onUp,
  block,
  icon,
  className,
  active,
}: ButtonProps) {
  const [buttonClass, activeClass, inactiveClass] = useClassNames(
    [button, button_light],
    [button_active, button_active_light],
    [button_inactive, button_inactive_light]
  )
  return (
    <Touchable
      className={cx(
        buttonClass,
        block && buttonBlock,
        active === true && activeClass,
        active === false && inactiveClass,
        className
      )}
      onDown={onDown}
      onUp={onUp}
    >
      {icon && <Icon icon={icon} inline className={iconStyle} shade={1} />}
      {children}
    </Touchable>
  )
}
