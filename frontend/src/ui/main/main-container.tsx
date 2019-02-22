import cx from 'classnames'
import React, { memo, Suspense, useCallback, useState } from 'react'

import { useRouterLocationChanged } from '../../hooks/router'
import { RoutesOutlet } from '../../pages/routes-outlet'
import { iconClose, iconMenu } from '../icons'
import { CornerButton } from '../navigation/corner-button'
import { Navigation } from '../navigation/navigation'

import styles from './main-container.scss'

const { x, content, contentBlurred, overlay } = styles

const navBreakpoint = 768
const alwaysShowNav = window.innerWidth >= navBreakpoint

const _MainContainer: React.SFC = () => {
  const [nav, setNav] = useState(alwaysShowNav)
  const locationChanged = useRouterLocationChanged()

  const toggleNav = useCallback(() => setNav(!nav), [nav])

  if (locationChanged && !alwaysShowNav) {
    setNav(false)
  }

  const navOverlayed = nav && !alwaysShowNav

  return (
    <div className={x}>
      {navOverlayed && <div className={overlay} onClick={toggleNav} />}
      {nav && (
        <Navigation showLabels={!alwaysShowNav} floating={!alwaysShowNav} />
      )}
      {!alwaysShowNav && (
        <CornerButton
          icon={nav ? iconClose : iconMenu}
          opacity={nav ? 50 : 20}
          onClick={toggleNav}
        />
      )}
      <div className={cx(content, navOverlayed && contentBlurred)}>
        <Suspense fallback={false}>
          <RoutesOutlet />
        </Suspense>
      </div>
    </div>
  )
}

export const MainContainer = memo(_MainContainer)
