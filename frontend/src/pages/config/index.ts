import { iconConfig } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { configPageRoute } from '../routes'

import ConfigPage from './config-page'

export const configPageNavItem: NavItemEntry = {
  route: configPageRoute,
  icon: iconConfig,
  label: 'Config',
  page: ConfigPage,
}
