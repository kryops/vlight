import { css } from 'linaria'
import React from 'react'
import { NavLink } from 'react-router-dom'

import { Icon } from '../icons/icon'
import { baselinePx, iconShade, primaryShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { useSettings } from '../../hooks/settings'

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

const navItem_light = css`
  &:hover {
    background: ${primaryShade(0)};

    & .${iconPath} {
      fill: ${iconShade(3)};
    }
  }
`

const navItem_active_light = css`
  background: ${primaryShade(0)};
  & .${iconPath} {
    fill: ${iconShade(0)};
  }

  &:hover {
    background: ${primaryShade(0)};
  }
`

const navLabel = css`
  padding-left: ${baselinePx * 2}px;
  padding-right: ${baselinePx * 4}px;
`

export interface NavItemProps {
  to: string
  icon: string
  label: string
  showLabel?: boolean
}

export const NavItem = memoInProduction(
  ({ to, icon, label, showLabel }: NavItemProps) => {
    const { lightMode } = useSettings()
    return (
      <NavLink
        to={to}
        title={label}
        className={cx(navItem, lightMode && navItem_light)}
        activeClassName={lightMode ? navItem_active_light : navItem_active}
      >
        <Icon icon={icon} shade={1} pathClassName={iconPath} />
        {showLabel && <span className={navLabel}>{label}</span>}
      </NavLink>
    )
  }
)
