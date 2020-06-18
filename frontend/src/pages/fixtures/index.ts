import { iconLight } from '../../ui/icons'
import { NavItemEntry } from '../index'
import { fixturesPageRoute } from '../routes'

import FixturesPage from './fixtures-page'

export const fixturesPageNavItem: NavItemEntry = {
  route: fixturesPageRoute,
  icon: iconLight,
  label: 'Fixtures',
  page: FixturesPage,
}
