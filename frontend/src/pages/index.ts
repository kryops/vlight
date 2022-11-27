import { universePageNavItem } from './universe'
import { channelsPageNavItem } from './channels'
import { fixturesPageNavItem } from './fixtures'
import { fixtureGroupsPageNavItem } from './fixture-groups'
import { memoriesPageNavItem } from './memories'
import { chasesPageNavItem } from './chases'
import { configPageNavItem } from './config'
import { settingsPageEntry } from './config/settings'
import { entitiesPageEntry } from './config/entities'
import { mapPageNavItem } from './map'
import { NavItemEntry, RouteEntry } from './types'

/**
 * The content of the main navigation.
 */
export const mainNavigationItems: NavItemEntry[] = [
  mapPageNavItem,
  universePageNavItem,
  channelsPageNavItem,
  fixturesPageNavItem,
  fixtureGroupsPageNavItem,
  memoriesPageNavItem,
  chasesPageNavItem,
  configPageNavItem,
]

/**
 * Routes that do not have a corresponding navigation item.
 */
export const standaloneRoutes: RouteEntry[] = [
  settingsPageEntry,
  entitiesPageEntry,
]
