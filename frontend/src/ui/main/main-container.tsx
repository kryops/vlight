import React, { memo, Suspense } from 'react'

import { RoutesOutlet } from '../../pages/routes-outlet'
import { Navigation } from '../navigation/navigation'

import styles from './main-container.scss'

const { x, content } = styles

const _MainContainer: React.SFC = () => (
  <div className={x}>
    <Navigation />
    <div className={content}>
      <Suspense fallback={false}>
        <RoutesOutlet />
      </Suspense>
    </div>
  </div>
)

export const MainContainer = memo(_MainContainer)
