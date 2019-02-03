import React from 'react'

import { ColorPercentage } from '../../types'
import { Icon } from '../icons/icon'

import styles from './corner-button.scss'

const { x } = styles

export interface Props {
  icon: string
  tooltip?: string
  opacity?: ColorPercentage
  onClick: () => void
}

export const CornerButton: React.SFC<Props> = ({
  icon,
  tooltip,
  opacity,
  onClick,
}) => (
  <div title={tooltip} className={x} onClick={onClick}>
    <Icon icon={icon} opacity={opacity || 20} />
  </div>
)
