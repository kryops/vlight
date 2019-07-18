import cx from 'classnames'
import { css } from 'linaria'
import React, { Suspense, useCallback, useState } from 'react'

import { useRouterLocationChanged } from '../../hooks/router'
import { RoutesOutlet } from '../../pages/routes-outlet'
import { iconClose, iconMenu } from '../icons'
import { CornerButton } from '../navigation/corner-button'
import { Navigation } from '../navigation/navigation'
import {
  backgroundColor,
  baselinePx,
  zNavigation,
  backgroundColorLight,
  textShadeLight,
} from '../styles'
import { memoInProduction } from '../../util/development'
import { useSettings } from '../../hooks/settings'

import { LoadingScreen } from './loading-screen'

const mainContainer = css`
  display: flex;
  height: 100%;
`

const mainContainerLight = css`
  background: ${backgroundColorLight};
  color: ${textShadeLight(0)};
`

const content = css`
  flex: 1 1 auto;
  padding: ${baselinePx * 4}px;
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

const navBreakpoint = 768
const alwaysShowNav = window.innerWidth >= navBreakpoint

const _MainContainer: React.SFC = () => {
  const [nav, setNav] = useState(alwaysShowNav)
  const locationChanged = useRouterLocationChanged()
  const { lightMode } = useSettings()

  const toggleNav = useCallback(() => setNav(!nav), [nav])

  if (locationChanged && !alwaysShowNav) {
    setNav(false)
  }

  const navOverlayed = nav && !alwaysShowNav

  return (
    <div className={cx(mainContainer, { [mainContainerLight]: lightMode })}>
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
    </div>
  )
}

export const MainContainer = memoInProduction(_MainContainer)
