import { channelsPageNavItem } from './channels'
import { fixturesPageNavItem } from './fixtures'
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
  fixturesPageNavItem,
  testPageNavItem,
]

export const entryRoute = universePageRoute
