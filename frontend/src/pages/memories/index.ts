import { iconMemory } from '../../ui/icons'
import { NavItemEntry } from '../index'
import { memoriesPageRoute } from '../routes'

import MemoriesPage from './memories-page'

export const memoriesPageNavItem: NavItemEntry = {
  route: memoriesPageRoute,
  icon: iconMemory,
  label: 'Memories',
  page: MemoriesPage,
}
