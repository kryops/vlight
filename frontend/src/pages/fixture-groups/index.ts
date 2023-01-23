import { iconGroup } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { fixtureGroupsPageRoute } from '../routes'

import FixtureGroupsPage from './fixture-groups-page'
import { isAnyFixtureGroupOn } from './fixture-group-actions'

export const fixtureGroupsPageNavItem: NavItemEntry = {
  route: fixtureGroupsPageRoute,
  icon: iconGroup,
  label: 'Fixture Groups',
  page: FixtureGroupsPage,
  highlighted: isAnyFixtureGroupOn,
}
