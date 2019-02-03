import React from 'react'
import { NavLink } from 'react-router-dom'

import { Icon } from '../icons/icon'

import styles from './nav-item.scss'

const { x, iconPath, xActive } = styles

export interface Props {
  icon: string
  label: string
  to: string
}

export const NavItem: React.SFC<Props> = ({ icon, label, to }) => (
  <NavLink to={to} title={label} className={x} activeClassName={xActive}>
    <Icon icon={icon} percent={50} pathClassName={iconPath} />
  </NavLink>
)
