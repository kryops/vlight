import { iconSettings } from '../../ui/icons'
import { NavItemEntry } from '../index'

import SettingsPage from './settings-page'

export const settingsPageRoute = '/settings'

export const settingsPageNavItem: NavItemEntry = {
  route: settingsPageRoute,
  icon: iconSettings,
  label: 'Settings',
  page: SettingsPage,
}
