import { universePageNavItem } from './universe'
import { channelsPageNavItem } from './channels'
import { fixturesPageNavItem } from './fixtures'
import { fixtureGroupsPageNavItem } from './fixture-groups'
import { memoriesPageNavItem } from './memories'
import { configPageNavItem } from './config'
import { testPageNavItem } from './test'
import { settingsPageEntry } from './config/settings'
import { entitiesPageEntry } from './config/entities'

export interface RouteEntry {
  route: string
  page: React.ComponentType
}

export interface NavItemEntry extends RouteEntry {
  icon: string
  label: string
}

export const mainNavigationItems: NavItemEntry[] = [
  universePageNavItem,
  channelsPageNavItem,
  fixturesPageNavItem,
  fixtureGroupsPageNavItem,
  memoriesPageNavItem,
  configPageNavItem,
  testPageNavItem,
]

export const standaloneRoutes: RouteEntry[] = [
  settingsPageEntry,
  entitiesPageEntry,
]
