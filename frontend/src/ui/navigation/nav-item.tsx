import React, { memo } from 'react'
import { NavLink } from 'react-router-dom'

import { Icon } from '../icons/icon'

import styles from './nav-item.scss'

const { x, iconPath, xActive, navLabel } = styles

export interface Props {
  to: string
  icon: string
  label: string
  showLabel?: boolean
}

const _NavItem: React.SFC<Props> = ({ to, icon, label, showLabel }) => (
  <NavLink to={to} title={label} className={x} activeClassName={xActive}>
    <Icon icon={icon} opacity={50} pathClassName={iconPath} />
    {showLabel && <span className={navLabel}>{label}</span>}
  </NavLink>
)

export const NavItem = memo(_NavItem)
