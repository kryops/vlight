import { iconChase } from '../../ui/icons'
import { isAnyOn } from '../../util/state'
import { NavItemEntry } from '../index'
import { chasesPageRoute } from '../routes'

import ChasesPage from './chases-page'

export const chasesPageNavItem: NavItemEntry = {
  route: chasesPageRoute,
  icon: iconChase,
  label: 'Chases',
  page: ChasesPage,
  highlighted: apiState => isAnyOn(apiState.liveChases ?? {}),
}
