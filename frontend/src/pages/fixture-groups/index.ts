import { lazy } from 'react'

import { NavItemEntry } from '..'

import { iconGroup } from '../../ui/icons'

export const FixtureGroupsPage = lazy(() =>
  import(/* webpackChunkName: "fixtures" */ './fixture-groups-page')
)

export const fixtureGroupsPageRoute = '/fixture-groups'

export const fixtureGroupsPageNavItem: NavItemEntry = {
  route: fixtureGroupsPageRoute,
  icon: iconGroup,
  label: 'Fixture Groups',
  page: FixtureGroupsPage,
}
