import { lazy } from 'react'

import { iconGroup } from '../../ui/icons'
import { NavItemEntry } from '../index'

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
