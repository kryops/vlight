import cx from 'classnames'
import { css } from 'linaria'
import React from 'react'

import { mainNavigationItems } from '../../pages'
import { primaryShade, zNavigation, backgroundColorLight } from '../styles'
import { memoInProduction } from '../../util/development'
import { useMasterData } from '../../hooks/api'
import { useSettings } from '../../hooks/settings'
import { dynamicPageRoute } from '../../pages/dynamic'
import { iconDynamicPage } from '../icons'

import { NavItem } from './nav-item'

const navigation = css`
  flex: 0 0 auto;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  background: ${primaryShade(4)};
`

const navigation_light = css`
  background: ${backgroundColorLight};
`

const navigation_floating = css`
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${zNavigation};
  box-shadow: 2px 0 10px icon(10%);
`

export interface NavigationProps {
  showLabels?: boolean
  floating?: boolean
}

export const Navigation = memoInProduction(
  ({ showLabels, floating }: NavigationProps) => {
    const { lightMode } = useSettings()
    const masterData = useMasterData()
    const { dynamicPages } = masterData

    return (
      <div
        className={cx(
          navigation,
          floating && navigation_floating,
          lightMode && navigation_light
        )}
      >
        {mainNavigationItems.map(({ route, icon, label }) => (
          <NavItem
            key={route}
            to={route}
            icon={icon}
            label={label}
            showLabel={showLabels}
          />
        ))}
        {dynamicPages.map(({ id, icon, headline }) => (
          <NavItem
            key={id}
            to={dynamicPageRoute(id)}
            icon={icon ?? iconDynamicPage}
            label={headline ?? id}
            showLabel={showLabels}
          />
        ))}
      </div>
    )
  }
)
