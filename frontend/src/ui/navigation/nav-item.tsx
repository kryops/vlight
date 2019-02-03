import cx from 'classnames'
import React, { memo } from 'react'

import { Icon } from '../icons/icon'

import styles from './nav-item.scss'

const { x, iconPath, xActive } = styles

export interface Props {
  icon: string
  label: string
  active?: boolean
}

const _NavItem: React.SFC<Props> = ({ icon, label, active }) => (
  <div className={cx(x, active && xActive)} title={label}>
    <Icon icon={icon} percent={50} pathClassName={iconPath} />
  </div>
)

export const NavItem = memo(_NavItem)
