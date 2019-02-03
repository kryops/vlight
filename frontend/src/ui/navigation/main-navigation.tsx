import React from 'react'

import { iconExperiment, iconFader, iconLight } from '../icons'

import styles from './main-navigation.scss'
import { NavItem } from './nav-item'

const { x } = styles

export const MainNavigation: React.SFC = () => (
  <div className={x}>
    <NavItem icon={iconFader} label="Channels" active />
    <NavItem icon={iconLight} label="Fixtures" />
    <NavItem icon={iconExperiment} label="Test" />
  </div>
)
