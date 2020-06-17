import { RouteEntry } from '../../index'

import SettingsPage from './settings-page'

export const settingsPageRoute = '/settings'

export const settingsPageEntry: RouteEntry = {
  route: settingsPageRoute,
  page: SettingsPage,
}
