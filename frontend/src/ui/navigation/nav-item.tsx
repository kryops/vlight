import { css } from '@linaria/core'
import { NavLink, useNavigate } from 'react-router-dom'

import { Icon } from '../icons/icon'
import { baseline, primaryShade } from '../styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { useHotkey } from '../../hooks/hotkey'

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

const navItem_highlighted = css`
  border-left: ${baseline(1)} solid ${primaryShade(1)};
  padding-left: ${baseline(paddingBaseline - 1)};
`

const navLabel = css`
  padding-left: ${baseline(2)};
  padding-right: ${baseline(4)};
`

export interface NavItemProps {
  /** Route target */
  to: string

  icon: string
  label: string

  /**
   *
   * Controls whether to display the label.
   *
   * Defaults to `false`.
   */
  showLabel?: boolean

  /**
   *
   * Controls whether to display the item as highlighted.
   *
   * Defaults to `false`.
   */
  highlighted?: boolean

  /** Hotkey to navigate to the item's destination with. */
  hotkey?: string
}

/**
 * Navigation item component.
 */
export const NavItem = memoInProduction(
  ({
    to,
    icon,
    label,
    showLabel = false,
    highlighted = false,
    hotkey,
  }: NavItemProps) => {
    const navigate = useNavigate()

    useHotkey(hotkey, () => navigate(to), { forceActive: true })

    return (
      <NavLink
        to={to}
        title={label}
        className={({ isActive }) =>
          cx(
            navItem,
            highlighted && navItem_highlighted,
            isActive && navItem_active
          )
        }
      >
        <Icon icon={icon} shade={highlighted ? 0 : 1} />
        {showLabel && <span className={navLabel}>{label}</span>}
      </NavLink>
    )
  }
)
