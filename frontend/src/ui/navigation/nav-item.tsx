import { css } from 'linaria'
import { NavLink } from 'react-router-dom'

import { Icon } from '../icons/icon'
import { baseline, primaryShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { useClassNames } from '../../hooks/ui'
import { cx } from '../../util/styles'

const paddingBaseline = 3

const navItem = css`
  display: flex;
  align-items: center;
  padding: ${baseline(paddingBaseline)};

  &:hover {
    background: ${primaryShade(3)};
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
  }
`

const navItem_highlighted = css`
  border-left: ${baseline(1)} solid ${primaryShade(1)};
  padding-left: ${baseline(paddingBaseline - 1)};
`

const navItem_highlighted_light = css`
  border-left-color: ${primaryShade(1, true)};
`

const navItem_active_light = css`
  background: ${primaryShade(2, true)};

  &:hover {
    background: ${primaryShade(2, true)};
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
  highlighted?: boolean
}

export const NavItem = memoInProduction(
  ({ to, icon, label, showLabel, highlighted }: NavItemProps) => {
    const [className, activeClassName, highlightClass] = useClassNames(
      [navItem, navItem_light],
      [navItem_active, navItem_active_light],
      [navItem_highlighted, navItem_highlighted_light]
    )
    return (
      <NavLink
        to={to}
        title={label}
        className={cx(className, highlighted && highlightClass)}
        activeClassName={activeClassName}
      >
        <Icon icon={icon} shade={highlighted ? 0 : 1} />
        {showLabel && <span className={navLabel}>{label}</span>}
      </NavLink>
    )
  }
)
