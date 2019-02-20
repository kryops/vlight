import { channelsPageNavItem } from './channels'
import { testPageNavItem } from './test'
import { universePageNavItem, universePageRoute } from './universe'

export interface NavItemEntry {
  route: string
  icon: string
  label: string
  page: React.ComponentType
}

export const mainNavigationItems: NavItemEntry[] = [
  universePageNavItem,
  channelsPageNavItem,
  testPageNavItem,
]

export const entryRoute = universePageRoute
