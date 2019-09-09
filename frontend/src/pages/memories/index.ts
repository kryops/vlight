import { lazy } from 'react'

import { iconMemory } from '../../ui/icons'
import { NavItemEntry } from '../index'

export const MemoriesPage = lazy(() =>
  import(/* webpackChunkName: "memories" */ './memories-page')
)

export const memoriesPageRoute = '/memories'

export const memoriesPageNavItem: NavItemEntry = {
  route: memoriesPageRoute,
  icon: iconMemory,
  label: 'Memories',
  page: MemoriesPage,
}
