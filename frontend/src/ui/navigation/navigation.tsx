import { css } from '@linaria/core'

import { mainNavigationItems } from '../../pages'
import { primaryShade, zNavigation } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { useCompleteApiState, useMasterData } from '../../hooks/api'
import { iconDynamicPage } from '../icons'
import { dynamicPageRoute } from '../../pages/routes'

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

export interface NavigationProps {
  /**
   * Controls whether to display the navigation floating above the content.
   *
   * Defaults to `false`.
   */
  showLabels?: boolean

  /**
   * Controls whether to display the navigation floating above the content.
   *
   * Defaults to `false`.
   */
  floating?: boolean
}

/**
 * Main navigation component.
 */
export const Navigation = memoInProduction(
  ({ showLabels = false, floating = false }: NavigationProps) => {
    const masterData = useMasterData()
    const apiState = useCompleteApiState(['universe'])
    const { dynamicPages } = masterData

    return (
      <div className={cx(navigation, floating && navigation_floating)}>
        {mainNavigationItems.map(({ route, icon, label, highlighted }) => (
          <NavItem
            key={route}
            to={route}
            icon={icon}
            label={label}
            showLabel={showLabels}
            highlighted={highlighted?.(apiState) ?? false}
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
