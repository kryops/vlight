import { iconMemory } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { memoriesPageRoute } from '../routes'

import MemoriesPage from './memories-page'
import { isAnyMemoryOn } from './memories-actions'

export const memoriesPageNavItem: NavItemEntry = {
  route: memoriesPageRoute,
  icon: iconMemory,
  label: 'Memories',
  page: MemoriesPage,
  highlighted: isAnyMemoryOn,
}
