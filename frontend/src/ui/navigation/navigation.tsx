import React, { memo } from 'react'

import { mainNavigationItems } from '../../pages'

import { NavItem } from './nav-item'
import styles from './navigation.scss'

const { x } = styles

const _Navigation: React.SFC = () => (
  <div className={x}>
    {mainNavigationItems.map(({ route, icon, label }) => (
      <NavItem key={route} to={route} icon={icon} label={label} />
    ))}
  </div>
)

export const Navigation = memo(_Navigation)
