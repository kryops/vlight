import { lazy } from 'react'

import { iconLight } from '../../ui/icons'
import { NavItemEntry } from '../index'

export const FixturesPage = lazy(() =>
  import(/* webpackChunkName: "fixtures" */ './fixtures-page')
)

export const fixturesPageRoute = '/fixtures'

export const fixturesPageNavItem: NavItemEntry = {
  route: fixturesPageRoute,
  icon: iconLight,
  label: 'Fixtures',
  page: FixturesPage,
}
