import { iconMap } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { mapPageRoute } from '../routes'

import MapPage from './map-page'

export const mapPageNavItem: NavItemEntry = {
  route: mapPageRoute,
  icon: iconMap,
  label: 'Map',
  page: MapPage,
}
