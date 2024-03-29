import { iconUniverse } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { universePageRoute } from '../routes'

import UniversePage from './universe-page'

export const universePageNavItem: NavItemEntry = {
  route: universePageRoute,
  icon: iconUniverse,
  label: 'Universe',
  page: UniversePage,
}
