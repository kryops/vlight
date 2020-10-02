import { ApiState } from '../api/worker/processing'

import { universePageNavItem } from './universe'
import { channelsPageNavItem } from './channels'
import { fixturesPageNavItem } from './fixtures'
import { fixtureGroupsPageNavItem } from './fixture-groups'
import { memoriesPageNavItem } from './memories'
import { configPageNavItem } from './config'
import { testPageNavItem } from './test'
import { settingsPageEntry } from './config/settings'
import { entitiesPageEntry } from './config/entities'
import { mapPageNavItem } from './map'

export interface RouteEntry {
  route: string
  page: React.ComponentType
}

export interface NavItemEntry extends RouteEntry {
  icon: string
  label: string
  highlighted?: (apiState: ApiState) => boolean
}

export const mainNavigationItems: NavItemEntry[] = [
  mapPageNavItem,
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
