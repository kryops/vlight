import { css } from 'linaria'
import React from 'react'

import { ColorShade } from '../../types'
import { baseline, iconShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { useSettings } from '../../hooks/settings'

const iconSize = baseline(6)

const iconSvg = css`
  width: ${iconSize};
  height: ${iconSize};
  display: block;
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

export interface IconProps {
  icon: string
  shade?: ColorShade
  color?: string
  className?: string
  pathClassName?: string
  inline?: boolean
  hoverable?: boolean
  onClick?: () => void
}

export const Icon = memoInProduction(
  ({
    icon,
    shade = 0,
    className,
    pathClassName,
    color,
    inline,
    hoverable,
    onClick,
  }: IconProps) => {
    const { lightMode } = useSettings()

    return (
      <svg
        viewBox="0 0 24 24"
        className={cx(
          iconSvg,
          inline && iconInline,
          hoverable && iconHoverable,
          onClick && iconClickable,
          className
        )}
        onClick={onClick}
      >
        <path
          d={icon}
          className={pathClassName}
          style={{ fill: color ?? iconShade(shade, lightMode) }}
        />
      </svg>
    )
  }
)
