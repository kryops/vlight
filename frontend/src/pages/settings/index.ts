import { lazy } from 'react'

import { iconSettings } from '../../ui/icons'
import { NavItemEntry } from '../index'

export const SettingsPage = lazy(() =>
  import(/* webpackChunkName: "settings" */ './settings-page')
)

export const settingsPageRoute = '/settings'

export const settingsPageNavItem: NavItemEntry = {
  route: settingsPageRoute,
  icon: iconSettings,
  label: 'Settings',
  page: SettingsPage,
}
