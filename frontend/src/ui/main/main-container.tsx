import { css } from '@linaria/core'
import { Suspense, useCallback, useState } from 'react'
import { useLocation } from 'react-router'

import { RoutesOutlet } from '../../pages/routes-outlet'
import { iconClose, iconMenu } from '../icons'
import { CornerButton } from '../navigation/corner-button'
import { Navigation } from '../navigation/navigation'
import { baseline, zNavigation, backgroundColor } from '../styles'
import { cx } from '../../util/styles'
import { ErrorBoundary } from '../../util/error-boundary'

import { LoadingScreen } from './loading-screen'
import { CornerOverlay } from './corner-overlay'
import { RecordingBar } from './recording-bar'
import { useRecordingState } from '../../api/recording'

const outerContainer = css`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const mainContainer = css`
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
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
 * - the action recording bar
 */
export const MainContainer = () => {
  const [nav, setNav] = useState(alwaysShowNav)
  const location = useLocation()

  const toggleNav = useCallback(() => setNav(!nav), [nav])

  // close the navigation after navigating
  const [prevLocationKey, setPrevLocationKey] = useState(location.key)
  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key)
    if (!alwaysShowNav) setNav(false)
  }

  const navOverlayed = nav && !alwaysShowNav

  const { barVisible, active: recording } = useRecordingState()

  return (
    <div className={outerContainer}>
      <div className={mainContainer}>
        {navOverlayed && <div className={overlay} onClick={toggleNav} />}
        {nav && (
          <Navigation showLabels={!alwaysShowNav} floating={!alwaysShowNav} />
        )}
        {!alwaysShowNav && (
          <CornerButton
            icon={nav ? iconClose : iconMenu}
            tooltip={nav ? 'Close navigation' : 'Open navigation'}
            shade={nav ? 1 : 2}
            onClick={toggleNav}
          />
        )}
        <main className={cx(content, navOverlayed && content_blurred)}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <RoutesOutlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <CornerOverlay />
      </div>
      {(barVisible || recording) && <RecordingBar />}
    </div>
  )
}
