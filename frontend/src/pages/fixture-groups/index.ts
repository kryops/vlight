import { iconGroup } from '../../ui/icons'
import { NavItemEntry } from '../index'
import { fixtureGroupsPageRoute } from '../routes'

import FixtureGroupsPage from './fixture-groups-page'

export const fixtureGroupsPageNavItem: NavItemEntry = {
  route: fixtureGroupsPageRoute,
  icon: iconGroup,
  label: 'Fixture Groups',
  page: FixtureGroupsPage,
}
