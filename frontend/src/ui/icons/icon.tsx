import { css } from '@linaria/core'
import { AriaAttributes, MouseEvent as ReactMouseEvent } from 'react'

import { ColorShade } from '../../types'
import { baseline, iconShade } from '../styles'
import { cx } from '../../util/styles'

const iconSize = baseline(6)

const iconSvg = css`
  width: ${iconSize};
  height: ${iconSize};
  display: block;
  flex: 0 0 auto;
`

const icon_inline = css`
  display: inline;
  vertical-align: middle;
  position: relative;
  top: ${baseline(-0.5)};
`

const icon_clickable = css`
  cursor: pointer;

  &:active {
    filter: drop-shadow(0 0 ${baseline()} ${iconShade(1)});
  }
`

const icon_hoverable = css`
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
`

const icon_padding = css`
  padding: ${baseline(2)};
`

export interface IconProps extends AriaAttributes {
  /** SVG 24x24 icon path string. */
  icon: string

  /**
   * Color shade from 0-4.
   *
   * Defaults to 0 (maximum intensity).
   */
  shade?: ColorShade

  color?: string

  /**
   * Size in multiples of the baseline width.
   *
   * Defaults to 6.
   */
  size?: number

  className?: string

  /** CSS class name applied to the SVG path itself. */
  pathClassName?: string

  /**
   * Controls whether the icon should be displayed inline.
   *
   * Default to `false`.
   */
  inline?: boolean

  /**
   * Size in multiples of the baseline width,
   * or true for a default padding.
   */
  padding?: boolean | number

  /**
   * Controls whether the icon has a hover effect.
   *
   * Default to `false`.
   */
  hoverable?: boolean

  /**
   * Tooltip text, rendered as SVG title.
   *
   * Also used as accessible name. Icons without title are hidden from assistive technology.
   */
  title?: string

  /**
   * ARIA role. Defaults to `button` for clickable icons with a title,
   * and `img` for other icons with a title.
   */
  role?: string

  onClick?: (event: ReactMouseEvent<SVGSVGElement, MouseEvent>) => void
}

/**
 * Generic icon component.
 */
export const Icon = ({
  icon,
  shade = 0,
  className,
  pathClassName,
  color,
  size,
  inline = false,
  padding,
  hoverable = false,
  title,
  role,
  onClick,
  ...aria
}: IconProps) => {
  const hasName = !!(title || aria['aria-label'] || aria['aria-labelledby'])
  const roleToUse = role ?? (hasName ? (onClick ? 'button' : 'img') : undefined)

  return (
    <svg
      viewBox="0 0 24 24"
      role={roleToUse}
      aria-label={title}
      aria-hidden={!roleToUse || undefined}
      {...aria}
      className={cx(
        iconSvg,
        inline && icon_inline,
        hoverable && icon_hoverable,
        onClick && icon_clickable,
        padding === true && icon_padding,
        className
      )}
      style={
        size || typeof padding === 'number'
          ? {
              width: size ? baseline(size) : undefined,
              height: size ? baseline(size) : undefined,
              padding:
                typeof padding === 'number' ? baseline(padding) : undefined,
            }
          : undefined
      }
      onClick={onClick}
    >
      {title && <title>{title}</title>}
      <path
        d={icon}
        className={pathClassName}
        style={{ fill: color ?? iconShade(shade) }}
      />
    </svg>
  )
}
