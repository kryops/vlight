import { css } from 'linaria'
import React, { Suspense, useCallback, useState, useEffect } from 'react'
import { useLocation } from 'react-router'

import { RoutesOutlet } from '../../pages/routes-outlet'
import { iconClose, iconMenu, iconLight } from '../icons'
import { CornerButton } from '../navigation/corner-button'
import { Navigation } from '../navigation/navigation'
import {
  backgroundColor,
  baseline,
  zNavigation,
  backgroundColorLight,
  textShade,
  zDevOverlay,
} from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { useSettings } from '../../hooks/settings'
import { devMode } from '../../config'
import { Icon } from '../icons/icon'
import { useClassName } from '../../hooks/ui'

import { LoadingScreen } from './loading-screen'

const mainContainer = css`
  display: flex;
  height: 100%;
`

const mainContainer_light = css`
  background: ${backgroundColorLight};
  color: ${textShade(0, true)};

  & a {
    color: ${textShade(0, true)};
  }
`

const content = css`
  flex: 1 1 auto;
  padding: ${baseline(4)};
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
`

const content_blurred = css`
  filter: blur(2px);
`

const overlay = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${backgroundColor};
  opacity: 0.5;
  z-index: ${zNavigation};
`

const devOverlay = css`
  position: absolute;
  z-index: ${zDevOverlay};
  bottom: ${baseline(3)};
  right: ${baseline(3)};
`

const navBreakpoint = 768
const alwaysShowNav = window.innerWidth >= navBreakpoint

export const MainContainer = memoInProduction(() => {
  const [nav, setNav] = useState(alwaysShowNav)
  const location = useLocation()
  const { lightMode, updateSettings } = useSettings()
  const className = useClassName(mainContainer, mainContainer_light)

  const toggleNav = useCallback(() => setNav(!nav), [nav])

  useEffect(() => {
    if (!alwaysShowNav) setNav(false)
  }, [location])

  const navOverlayed = nav && !alwaysShowNav

  return (
    <div className={className}>
      {navOverlayed && <div className={overlay} onClick={toggleNav} />}
      {nav && (
        <Navigation showLabels={!alwaysShowNav} floating={!alwaysShowNav} />
      )}
      {!alwaysShowNav && (
        <CornerButton
          icon={nav ? iconClose : iconMenu}
          shade={nav ? 1 : 2}
          onClick={toggleNav}
        />
      )}
      <div className={cx(content, navOverlayed && content_blurred)}>
        <Suspense fallback={<LoadingScreen />}>
          <RoutesOutlet />
        </Suspense>
      </div>
      {devMode && (
        <div className={devOverlay}>
          <Icon
            icon={iconLight}
            onClick={() => updateSettings({ lightMode: !lightMode })}
          />
        </div>
      )}
    </div>
  )
})
