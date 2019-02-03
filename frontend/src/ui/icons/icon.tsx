import cx from 'classnames'
import React, { memo } from 'react'

import { ColorPercentage } from '../../types'

import styles from './icon.scss'

const { x, path100 } = styles

export interface Props {
  icon: string
  percent?: ColorPercentage
  pathClassName?: string
}

const _Icon: React.SFC<Props> = ({ icon, percent = 100, pathClassName }) => (
  <svg viewBox="0 0 24 24" className={x}>
    <path
      d={icon}
      className={cx(styles['path' + percent] || path100, pathClassName)}
    />
  </svg>
)

export const Icon = memo(_Icon)
