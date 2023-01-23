import { iconChase } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { chasesPageRoute } from '../routes'

import ChasesPage from './chases-page'
import { isAnyChaseOn } from './chases-actions'

export const chasesPageNavItem: NavItemEntry = {
  route: chasesPageRoute,
  icon: iconChase,
  label: 'Chases',
  page: ChasesPage,
  highlighted: isAnyChaseOn,
}
