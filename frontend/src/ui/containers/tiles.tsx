import { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'
import { css } from '@linaria/core'

import { Icon } from '../icons/icon'
import { primaryShade, baseline } from '../styles'
import { flexWrap } from '../css/flex'

/**
 * Container element for rendering tiles in a grid.
 */
export const TileGrid = ({ children }: PropsWithChildren<{}>) => (
  <div className={flexWrap}>{children}</div>
)

const tile = css`
  flex: 1 1 0;
  min-width: ${baseline(40)};
  padding: ${baseline(4)};
  margin-right: ${baseline(2)};
  margin-bottom: ${baseline(2)};
  background: ${primaryShade(2)};
  text-align: center;
  cursor: pointer;

  &:hover {
    background: ${primaryShade(1)};
  }
`

const iconSize = baseline(16)

const tileIcon = css`
  width: ${iconSize};
  height: ${iconSize};
  margin: auto;
`

const titleTitle = css`
  margin-top: ${baseline(4)};
  font-size: 1.25rem;
`

export interface TileProps {
  /** SVG icon path. */
  icon: string

  title: string

  /** Target route string. */
  target?: string

  onClick?: () => void
}

/**
 * Generic tile component with an icon and a title.
 */
export function Tile({ icon, title, target, onClick }: TileProps) {
  const navigate = useNavigate()

  const clickHandler = () => {
    if (target) navigate(target)
    onClick?.()
  }

  return (
    <div className={tile} onClick={clickHandler}>
      <Icon icon={icon} shade={1} className={tileIcon} />
      <div className={titleTitle}>{title}</div>
    </div>
  )
}
