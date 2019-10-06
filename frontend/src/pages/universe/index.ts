import { iconSun } from '../../ui/icons'
import { NavItemEntry } from '../index'

import UniversePage from './universe-page'

export const universePageRoute = '/universe'

export const universePageNavItem: NavItemEntry = {
  route: universePageRoute,
  icon: iconSun,
  label: 'Universe',
  page: UniversePage,
}
