import { css } from '@linaria/core'
import React, { ReactNode, useState } from 'react'

import { baseline, iconShade, primaryShade, textShade } from '../styles'
import { cx } from '../../util/styles'
import { Touchable } from '../components/touchable'
import { Icon } from '../icons/icon'
import { Clickable } from '../components/clickable'
import { NormalizedTouchEvent } from '../../util/touch'
import { useHotkey } from '../../hooks/hotkey'
import { memoInProduction } from '../../util/development'

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

  &:active > svg {
    filter: drop-shadow(0 0 ${baseline(0.5)} ${iconShade(0)});
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

const button_transparent = css`
  background: transparent;
  margin-left: 0;

  &:hover,
  &:active {
    background: transparent;
  }

  &.${button_active} > svg {
    opacity: 1;
  }
`

const buttonBlock = css`
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin: ${baseline()} 0;
`

const iconStyle = css`
  margin-right: ${baseline()};
`

export interface ButtonProps<T> {
  /** The button's content. */
  children?: ReactNode

  /**
   * Normal click handler.
   *
   * For time-critical actions, consider using {@link onDown} and {@link onUp} instead.
   */
  onClick?: (
    event:
      | React.MouseEvent<HTMLElement>
      | NormalizedTouchEvent<HTMLDivElement>
      | undefined,
    arg: T
  ) => void

  /** Argument to pass to click handlers. */
  onClickArg?: T

  /**
   * Handler to be executed when the user taps onto the button.
   *
   * NOTE: Prefer {@link onClick} for non-critical actions, as it will not block scrolling.
   */
  onDown?: (arg: T) => void

  /**
   * Handler to be executed when the user lifts a pointer off the button.
   *
   * NOTE: Prefer {@link onClick} for non-critical actions, as it will not block scrolling.
   */
  onUp?: (arg: T) => void

  /** SVG path of the icon to display on the button. */
  icon?: string

  /** Color to display the icon in. */
  iconColor?: string

  /** Hotkey to activate the button with. */
  hotkey?: string

  /**
   * Displays the button as a block element.
   *
   * Default to `false`.
   */
  block?: boolean

  /**
   * Displays the button as:
   * - `true`: Active
   * - `false`: Inactive
   * - `undefined`: Neutral
   */
  active?: boolean

  /**
   * Displays the button as disabled.
   *
   * Defaults to `false`.
   */
  disabled?: boolean

  /**
   * Displays the button without background.
   *
   * Defaults to `false`.
   */
  transparent?: boolean

  /** Title to be displayed as tooltip. */
  title?: string

  className?: string
}

export const Button = memoInProduction(
  <T extends any = undefined>({
    children,
    onClick,
    onDown,
    onUp,
    onClickArg,
    icon,
    iconColor,
    hotkey,
    active,
    disabled = false,
    block = false,
    transparent = false,
    className,
    title,
  }: ButtonProps<T>) => {
    const [hotkeyPressed, setHotkeyPressed] = useState(false)

    const hotkeyEnabled = useHotkey(
      hotkey,
      event => {
        if (event.type === 'keyup') {
          onUp?.(onClickArg as T)
          setHotkeyPressed(false)
        } else {
          onDown?.(onClickArg as T)
          onClick?.(undefined, onClickArg as T)
          setHotkeyPressed(true)
        }
      },
      { keyup: true }
    )

    const transparentIcon = !children && transparent
    const inactive = active === false || disabled

    const classNames = cx(
      button,
      block && buttonBlock,
      (active === true || hotkeyPressed) && button_active,
      inactive && button_inactive,
      disabled && button_disabled,
      transparent && button_transparent,
      className
    )

    const hotkeyTooltip =
      hotkey && hotkeyEnabled ? `(${hotkey.toUpperCase()})` : undefined

    const titleToDisplay =
      title && hotkeyTooltip
        ? `${title} ${hotkeyTooltip}`
        : title || hotkeyTooltip

    const content = (
      <>
        {icon && (
          <Icon
            icon={icon}
            color={iconColor}
            inline
            className={children ? iconStyle : undefined}
            hoverable={transparentIcon && active === undefined}
            shade={transparentIcon && !inactive ? 0 : 1}
          />
        )}
        {children}
      </>
    )

    return onDown || onUp ? (
      <Touchable
        className={classNames}
        title={titleToDisplay}
        onDown={onDown && (() => onDown(onClickArg as T))}
        onUp={
          (onUp && (() => onUp(onClickArg as T))) ??
          (onClick && (() => onClick(undefined, onClickArg as T)))
        }
      >
        {content}
      </Touchable>
    ) : (
      <Clickable
        className={classNames}
        title={titleToDisplay}
        onClick={onClick && (event => onClick(event, onClickArg as T))}
      >
        {content}
      </Clickable>
    )
  }
)
