import { css } from 'linaria'
import React from 'react'
import { NavLink } from 'react-router-dom'

import { Icon } from '../icons/icon'
import { baseline, iconShade, primaryShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { useClassNames } from '../../hooks/ui'

const iconPath = css``

const navItem = css`
  display: flex;
  align-items: center;
  padding: ${baseline(3)};

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
    background: ${primaryShade(4, true)};

    & .${iconPath} {
      fill: ${iconShade(0, true)};
    }
  }
`

const navItem_active_light = css`
  background: ${primaryShade(2, true)};

  &:hover {
    background: ${primaryShade(2, true)};
  }

  & .${iconPath} {
    fill: ${iconShade(1, true)};
  }
`

const navLabel = css`
  padding-left: ${baseline(2)};
  padding-right: ${baseline(4)};
`

export interface NavItemProps {
  to: string
  icon: string
  label: string
  showLabel?: boolean
}

export const NavItem = memoInProduction(
  ({ to, icon, label, showLabel }: NavItemProps) => {
    const [className, activeClassName] = useClassNames(
      [navItem, navItem_light],
      [navItem_active, navItem_active_light]
    )
    return (
      <NavLink
        to={to}
        title={label}
        className={className}
        activeClassName={activeClassName}
      >
        <Icon icon={icon} shade={1} pathClassName={iconPath} />
        {showLabel && <span className={navLabel}>{label}</span>}
      </NavLink>
    )
  }
)
