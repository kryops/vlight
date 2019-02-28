import cx from 'classnames'
import { css } from 'linaria'
import React, { memo } from 'react'

import { ColorShade } from '../../types'
import { baselinePx, iconShade } from '../styles'

const iconSize = baselinePx * 6

const iconSvg = css`
  width: ${iconSize}px;
  height: ${iconSize}px;
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

export interface Props {
  icon: string
  shade?: ColorShade
  pathClassName?: string
}

const _Icon: React.SFC<Props> = ({ icon, shade = 0, pathClassName }) => (
  <svg viewBox="0 0 24 24" className={iconSvg}>
    <path
      d={icon}
      className={cx(pathShades[shade] || pathShades[0], pathClassName)}
    />
  </svg>
)

export const Icon = memo(_Icon)
