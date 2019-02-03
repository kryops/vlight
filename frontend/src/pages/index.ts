import { channelsPageNavItem } from './channels'
import { testPageNavItem } from './test'

export interface NavItemEntry {
  route: string
  icon: string
  label: string
  page: React.ComponentType
}

export const mainNavigationItems: NavItemEntry[] = [
  channelsPageNavItem,
  testPageNavItem,
]
