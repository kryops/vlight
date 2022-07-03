import { css } from '@linaria/core'
import { Suspense, useCallback, useState, useEffect } from 'react'
import { useLocation } from 'react-router'

import { RoutesOutlet } from '../../pages/routes-outlet'
import { iconClose, iconMenu } from '../icons'
import { CornerButton } from '../navigation/corner-button'
import { Navigation } from '../navigation/navigation'
import { baseline, zNavigation, backgroundColor } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'

import { LoadingScreen } from './loading-screen'
import { CornerOverlay } from './corner-overlay'

const mainContainer = css`
  display: flex;
  height: 100%;
`

const content = css`
  flex: 1 1 auto;
  padding: ${baseline(4)};
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
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

/**
 * Main container component that displays
 * - the navigation, or a corner button on small viewports
 * - the routing outlet for the main content
 * - the corner overlay for the minimal and quick settings
 */
export const MainContainer = memoInProduction(() => {
  const [nav, setNav] = useState(alwaysShowNav)
  const location = useLocation()

  const toggleNav = useCallback(() => setNav(!nav), [nav])

  useEffect(() => {
    if (!alwaysShowNav) setNav(false)
  }, [location])

  const navOverlayed = nav && !alwaysShowNav

  return (
    <div className={mainContainer}>
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
      <CornerOverlay />
    </div>
  )
})
