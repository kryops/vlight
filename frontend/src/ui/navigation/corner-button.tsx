import { css } from 'linaria'

import { ColorShade } from '../../types'
import { Icon } from '../icons/icon'
import { baseline, zNavigation } from '../styles'
import { memoInProduction } from '../../util/development'

const cornerButton = css`
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: ${zNavigation};
  padding: ${baseline(3)};
  cursor: pointer;
`

export interface CornerButtonProps {
  icon: string
  tooltip?: string
  shade?: ColorShade
  onClick: () => void
}

export const CornerButton = memoInProduction(
  ({ icon, tooltip, shade, onClick }: CornerButtonProps) => (
    <div title={tooltip} className={cornerButton} onClick={onClick}>
      <Icon icon={icon} shade={shade === undefined ? 2 : shade} />
    </div>
  )
)
