import { universePageNavItem, universePageRoute } from './universe'
import { channelsPageNavItem } from './channels'
import { fixturesPageNavItem } from './fixtures'
import { fixtureGroupsPageNavItem } from './fixture-groups'
import { settingsPageNavItem } from './settings'
import { testPageNavItem } from './test'

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
  fixtureGroupsPageNavItem,
  settingsPageNavItem,
  testPageNavItem,
]

export const entryRoute = universePageRoute
