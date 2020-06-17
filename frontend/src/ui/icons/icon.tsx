import { css } from 'linaria'
import React from 'react'

import { ColorShade } from '../../types'
import { baseline, iconShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'

const iconSize = baseline(6)

const iconSvg = css`
  width: ${iconSize};
  height: ${iconSize};
  display: block;
`

const path0 = css`
  fill: ${iconShade(0)};
`
const path1 = css`
  fill: ${iconShade(1)};
`
const path2 = css`
  fill: ${iconShade(2)};
`
const path3 = css`
  fill: ${iconShade(3)};
`
const path4 = css`
  fill: ${iconShade(4)};
`
const pathShades = [path0, path1, path2, path3, path4]

export interface IconProps {
  icon: string
  shade?: ColorShade
  color?: string
  className?: string
  pathClassName?: string
  onClick?: () => void
}

export const Icon = memoInProduction(
  ({
    icon,
    shade = 0,
    className,
    pathClassName,
    color,
    onClick,
  }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      className={cx(iconSvg, className)}
      onClick={onClick}
    >
      <path
        d={icon}
        className={cx(pathShades[shade] ?? pathShades[0], pathClassName)}
        style={color ? { fill: color } : undefined}
      />
    </svg>
  )
)
