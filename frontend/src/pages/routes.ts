import { EntityName } from '@vlight/entities'

export const channelsPageRoute = '/channels'
export const fixturesPageRoute = '/fixtures'
export const fixtureGroupsPageRoute = '/fixture-groups'
export const memoriesPageRoute = '/memories'
export const configPageRoute = '/config'
export const settingsPageRoute = configPageRoute + '/settings'
export const entitiesPageRoute = (
  type: EntityName | ':type' = ':type'
): string => `/entities/${type}`
export const testPageRoute = '/test'
export const universePageRoute = '/universe'
export const mapPageRoute = '/map'
export const dynamicPageRoute = (id = ':id'): string => `/dynamic/${id}`

export const _entryRoute = mapPageRoute
