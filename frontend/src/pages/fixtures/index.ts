import { iconLight } from '../../ui/icons'
import { NavItemEntry } from '../index'

import FixturesPage from './fixtures-page'

export const fixturesPageRoute = '/fixtures'

export const fixturesPageNavItem: NavItemEntry = {
  route: fixturesPageRoute,
  icon: iconLight,
  label: 'Fixtures',
  page: FixturesPage,
}
