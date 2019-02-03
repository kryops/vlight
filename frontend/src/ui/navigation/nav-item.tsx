import React from 'react'
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

export const NavItem: React.SFC<Props> = ({ to, icon, label, showLabel }) => (
  <NavLink to={to} title={label} className={x} activeClassName={xActive}>
    <Icon icon={icon} opacity={50} pathClassName={iconPath} />
    {showLabel && <span className={navLabel}>{label}</span>}
  </NavLink>
)
