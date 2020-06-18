import React from 'react'
import { useHistory } from 'react-router'
import { css } from 'linaria'

import { Icon } from '../icons/icon'
import { primaryShade, baseline } from '../styles'
import { cx } from '../../util/styles'
import { useSettings } from '../../hooks/settings'

const tileGrid = css`
  display: flex;
  flex-wrap: wrap;
`

export const TileGrid: React.FC = ({ children }) => (
  <div className={tileGrid}>{children}</div>
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

const tile_light = css`
  background: ${primaryShade(2, true)};

  &:hover {
    background: ${primaryShade(1, true)};
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
  icon: string
  title: string
  target?: string
  onClick?: () => void
}

export function Tile({ icon, title, target, onClick }: TileProps) {
  const history = useHistory()
  const { lightMode } = useSettings()

  const clickHandler = () => {
    if (target) history.push(target)
    onClick?.()
  }

  return (
    <div className={cx(tile, lightMode && tile_light)} onClick={clickHandler}>
      <Icon icon={icon} shade={1} className={tileIcon} />
      <div className={titleTitle}>{title}</div>
    </div>
  )
}
