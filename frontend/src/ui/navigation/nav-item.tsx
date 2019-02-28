import { css } from 'linaria'
import React, { memo } from 'react'
import { NavLink } from 'react-router-dom'

import { Icon } from '../icons/icon'
import { baselinePx, iconShade, primaryShade } from '../styles'

const iconPath = css``

const navItem = css`
  display: flex;
  align-items: center;
  padding: ${baselinePx * 3}px;

  &:hover {
    background: ${primaryShade(3)};

    & .${iconPath} {
      fill: ${iconShade(0)};
    }
  }
`

const navItem_active = css`
  background: ${primaryShade(2)};

  &:hover {
    background: ${primaryShade(2)};
  }
`

const navLabel = css`
  padding-left: ${baselinePx * 2}px;
  padding-right: ${baselinePx * 4}px;
`

export interface Props {
  to: string
  icon: string
  label: string
  showLabel?: boolean
}

const _NavItem: React.SFC<Props> = ({ to, icon, label, showLabel }) => (
  <NavLink
    to={to}
    title={label}
    className={navItem}
    activeClassName={navItem_active}
  >
    <Icon icon={icon} shade={1} pathClassName={iconPath} />
    {showLabel && <span className={navLabel}>{label}</span>}
  </NavLink>
)

export const NavItem = memo(_NavItem)
