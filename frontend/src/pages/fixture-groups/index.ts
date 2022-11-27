import { iconGroup } from '../../ui/icons'
import { isAnyOn } from '../../util/state'
import { NavItemEntry } from '../types'
import { fixtureGroupsPageRoute } from '../routes'

import FixtureGroupsPage from './fixture-groups-page'

export const fixtureGroupsPageNavItem: NavItemEntry = {
  route: fixtureGroupsPageRoute,
  icon: iconGroup,
  label: 'Fixture Groups',
  page: FixtureGroupsPage,
  highlighted: apiState => isAnyOn(apiState.fixtureGroups ?? {}),
}
