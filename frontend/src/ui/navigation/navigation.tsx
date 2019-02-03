import cx from 'classnames'
import React, { memo } from 'react'

import { mainNavigationItems } from '../../pages'

import { NavItem } from './nav-item'
import styles from './navigation.scss'

const { x, xFloating } = styles

export interface Props {
  showLabels?: boolean
  floating?: boolean
}

const _Navigation: React.SFC<Props> = ({ showLabels, floating }) => (
  <div className={cx(x, floating && xFloating)}>
    {mainNavigationItems.map(({ route, icon, label }) => (
      <NavItem
        key={route}
        to={route}
        icon={icon}
        label={label}
        showLabel={showLabels}
      />
    ))}
  </div>
)

export const Navigation = memo(_Navigation)
