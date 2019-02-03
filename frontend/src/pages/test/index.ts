import { lazy } from 'react'

import { NavItemEntry } from '..'
import { iconExperiment } from '../../ui/icons'

export const TestPage = lazy(() =>
  import(/* webpackChunkName: "test" */ './test-page')
)

export const testPageRoute = '/test'

export const testPageNavItem: NavItemEntry = {
  route: testPageRoute,
  icon: iconExperiment,
  label: 'Test',
  page: TestPage,
}
