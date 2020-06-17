import { iconSettings } from '../../ui/icons'
import { NavItemEntry } from '../index'

import ConfigPage from './config-page'

export const configPageRoute = '/config'

export const configPageNavItem: NavItemEntry = {
  route: configPageRoute,
  icon: iconSettings,
  label: 'Config',
  page: ConfigPage,
}
