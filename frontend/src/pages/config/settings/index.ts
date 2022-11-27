import { RouteEntry } from '../../types'
import { settingsPageRoute } from '../../routes'

import SettingsPage from './settings-page'

export const settingsPageEntry: RouteEntry = {
  route: settingsPageRoute,
  page: SettingsPage,
}
