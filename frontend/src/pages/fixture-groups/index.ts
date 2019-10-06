import { iconGroup } from '../../ui/icons'
import { NavItemEntry } from '../index'

import FixtureGroupsPage from './fixture-groups-page'

export const fixtureGroupsPageRoute = '/fixture-groups'

export const fixtureGroupsPageNavItem: NavItemEntry = {
  route: fixtureGroupsPageRoute,
  icon: iconGroup,
  label: 'Fixture Groups',
  page: FixtureGroupsPage,
}
