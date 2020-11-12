import { css } from 'linaria'
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

const iconInline = css`
  display: inline;
  vertical-align: middle;
  position: relative;
  top: ${baseline(-0.5)};
`

const iconClickable = css`
  cursor: pointer;
`

const iconHoverable = css`
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
`

const iconPadding = css`
  padding: ${baseline(2)};
`

export interface IconProps {
  icon: string
  shade?: ColorShade
  color?: string
  className?: string
  pathClassName?: string
  inline?: boolean
  padding?: boolean
  hoverable?: boolean
  onClick?: (event: ReactMouseEvent<SVGSVGElement, MouseEvent>) => void
}

export const Icon = memoInProduction(
  ({
    icon,
    shade = 0,
    className,
    pathClassName,
    color,
    inline,
    padding,
    hoverable,
    onClick,
  }: IconProps) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cx(
          iconSvg,
          inline && iconInline,
          hoverable && iconHoverable,
          onClick && iconClickable,
          padding && iconPadding,
          className
        )}
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
