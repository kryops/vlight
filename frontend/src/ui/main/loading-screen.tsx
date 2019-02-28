import { css } from 'linaria'
import React from 'react'

import { rotateAnimation } from '../animations/rotate'
import { iconLoading } from '../icons'
import { Icon } from '../icons/icon'

const loadingScreen = css`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const LoadingScreen: React.SFC = () => (
  <div className={loadingScreen}>
    <Icon icon={iconLoading} className={rotateAnimation} />
  </div>
)
