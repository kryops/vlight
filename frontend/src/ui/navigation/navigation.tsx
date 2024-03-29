import { css } from '@linaria/core'

import { mainNavigationItems } from '../../pages'
import { iconShade, primaryShade, zNavigation } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { useApiStateSelector, useMasterData } from '../../hooks/api'
import { iconDynamicPage } from '../icons'
import { dynamicPageRoute } from '../../pages/routes'

import { NavItem } from './nav-item'

const navigationHotkeys = [
  'Shift+1',
  'Shift+2',
  'Shift+3',
  'Shift+4',
  'Shift+5',
  'Shift+6',
  'Shift+7',
  'Shift+8',
  'Shift+9',
  'Shift+q',
  'Shift+w',
  'Shift+e',
  'Shift+r',
  'Shift+t',
]

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
  box-shadow: 2px 0 10px ${iconShade(2)};
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
    const highlightedItems = useApiStateSelector(apiState =>
      mainNavigationItems.map(item => item.highlighted?.(apiState) ?? false)
    )
    const { dynamicPages } = masterData

    return (
      <div className={cx(navigation, floating && navigation_floating)}>
        {mainNavigationItems.map(({ route, icon, label }, index) => (
          <NavItem
            key={route}
            to={route}
            icon={icon}
            label={label}
            showLabel={showLabels}
            highlighted={highlightedItems[index]}
            hotkey={navigationHotkeys[index]}
          />
        ))}
        {dynamicPages.map(({ id, icon, headline }, index) => (
          <NavItem
            key={id}
            to={dynamicPageRoute(id)}
            icon={icon ?? iconDynamicPage}
            label={headline ?? id}
            showLabel={showLabels}
            hotkey={navigationHotkeys[index + mainNavigationItems.length]}
          />
        ))}
      </div>
    )
  }
)
