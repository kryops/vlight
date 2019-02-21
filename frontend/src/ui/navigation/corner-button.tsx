import React, { memo } from 'react'

import { ColorPercentage } from '../../types'
import { compareWithoutFunctions } from '../../util/react'
import { Icon } from '../icons/icon'

import styles from './corner-button.scss'

const { x } = styles

export interface Props {
  icon: string
  tooltip?: string
  opacity?: ColorPercentage
  onClick: () => void
}

const _CornerButton: React.SFC<Props> = ({
  icon,
  tooltip,
  opacity,
  onClick,
}) => (
  <div title={tooltip} className={x} onClick={onClick}>
    <Icon icon={icon} opacity={opacity || 20} />
  </div>
)

export const CornerButton = memo(_CornerButton, compareWithoutFunctions)
