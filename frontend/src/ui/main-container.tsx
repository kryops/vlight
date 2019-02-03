import React from 'react'

import styles from './main-container.scss'
import { MainNavigation } from './navigation/main-navigation'

const { x, content } = styles

export const MainContainer: React.SFC = ({ children }) => (
  <div className={x}>
    <MainNavigation />
    <div className={content}>{children}</div>
  </div>
)
