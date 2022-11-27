import { iconLight } from '../../ui/icons'
import { isAnyOn } from '../../util/state'
import { NavItemEntry } from '../types'
import { fixturesPageRoute } from '../routes'

import FixturesPage from './fixtures-page'

export const fixturesPageNavItem: NavItemEntry = {
  route: fixturesPageRoute,
  icon: iconLight,
  label: 'Fixtures',
  page: FixturesPage,
  highlighted: apiState => isAnyOn(apiState.fixtures ?? {}),
}
