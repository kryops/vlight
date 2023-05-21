import { iconGlobal } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { globalPageRoute } from '../routes'

import GlobalPage from './global-page'

export const globalPageNavItem: NavItemEntry = {
  route: globalPageRoute,
  icon: iconGlobal,
  label: 'Global Controls',
  page: GlobalPage,
  highlighted: apiState =>
    apiState.dmxMaster !== 255 || apiState.dmxMasterFade !== 0,
}
