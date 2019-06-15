import cx from 'classnames'
import { css } from 'linaria'
import React from 'react'

import { mainNavigationItems } from '../../pages'
import { primaryShade, zNavigation } from '../styles'
import { memoInProduction } from '../../util/development'

import { NavItem } from './nav-item'

const navigation = css`
  flex: 0 0 auto;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  background: ${primaryShade(4)};
`

const navigation_floating = css`
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${zNavigation};
  box-shadow: 2px 0 10px icon(10%);
`

export interface Props {
  showLabels?: boolean
  floating?: boolean
}

const _Navigation: React.SFC<Props> = ({ showLabels, floating }) => (
  <div className={cx(navigation, floating && navigation_floating)}>
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

export const Navigation = memoInProduction(_Navigation)
