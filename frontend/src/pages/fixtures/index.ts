import { iconLight } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { fixturesPageRoute } from '../routes'

import FixturesPage from './fixtures-page'
import { isAnyFixtureOn } from './fixtures-actions'

export const fixturesPageNavItem: NavItemEntry = {
  route: fixturesPageRoute,
  icon: iconLight,
  label: 'Fixtures',
  page: FixturesPage,
  highlighted: isAnyFixtureOn,
}
