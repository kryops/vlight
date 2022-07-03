import { css } from '@linaria/core'
import { MouseEvent as ReactMouseEvent } from 'react'

import { ColorShade } from '../../types'
import { baseline, iconShade } from '../styles'
import { memoInProduction } from '../../util/development'
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

export interface IconProps {
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

  onClick?: (event: ReactMouseEvent<SVGSVGElement, MouseEvent>) => void
}

/**
 * Generic icon component.
 */
export const Icon = memoInProduction(
  ({
    icon,
    shade = 0,
    className,
    pathClassName,
    color,
    size,
    inline = false,
    padding,
    hoverable = false,
    onClick,
  }: IconProps) => {
    return (
      <svg
        viewBox="0 0 24 24"
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
        <path
          d={icon}
          className={pathClassName}
          style={{ fill: color ?? iconShade(shade) }}
        />
      </svg>
    )
  }
)
