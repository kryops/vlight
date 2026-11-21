import { universePageNavItem } from './universe'
import { channelsPageNavItem } from './channels'
import { fixturesPageNavItem } from './fixtures'
import { fixtureGroupsPageNavItem } from './fixture-groups'
import { memoriesPageNavItem } from './memories'
import { chasesPageNavItem } from './chases'
import { sequencesPageNavItem } from './sequences'
import { configPageNavItem } from './config'
import { settingsPageEntry } from './config/settings'
import { entitiesPageEntry } from './config/entities'
import { mapPageNavItem } from './map'
import { NavItemEntry, RouteEntry } from './types'
import { globalPageNavItem } from './global'

/**
 * The content of the main navigation.
 */
export const mainNavigationItems: NavItemEntry[] = [
  mapPageNavItem,
  universePageNavItem,
  globalPageNavItem,
  channelsPageNavItem,
  fixturesPageNavItem,
  fixtureGroupsPageNavItem,
  memoriesPageNavItem,
  chasesPageNavItem,
  sequencesPageNavItem,
  configPageNavItem,
]

/**
 * Routes that do not have a corresponding navigation item.
 */
export const standaloneRoutes: RouteEntry[] = [
  settingsPageEntry,
  entitiesPageEntry,
]
