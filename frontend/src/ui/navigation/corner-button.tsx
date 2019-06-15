import { css } from 'linaria'
import React from 'react'

import { ColorShade } from '../../types'
import { Icon } from '../icons/icon'
import { baselinePx, zNavigation } from '../styles'
import { memoInProduction } from '../../util/development'

const cornerButton = css`
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: ${zNavigation};
  padding: ${baselinePx * 3}px;
  cursor: pointer;
`

export interface Props {
  icon: string
  tooltip?: string
  shade?: ColorShade
  onClick: () => void
}

const _CornerButton: React.SFC<Props> = ({ icon, tooltip, shade, onClick }) => (
  <div title={tooltip} className={cornerButton} onClick={onClick}>
    <Icon icon={icon} shade={shade === undefined ? 2 : shade} />
  </div>
)

export const CornerButton = memoInProduction(_CornerButton)
