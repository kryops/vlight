import { iconMemory } from '../../ui/icons'
import { NavItemEntry } from '../index'

import MemoriesPage from './memories-page'

export const memoriesPageRoute = '/memories'

export const memoriesPageNavItem: NavItemEntry = {
  route: memoriesPageRoute,
  icon: iconMemory,
  label: 'Memories',
  page: MemoriesPage,
}
