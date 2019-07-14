import { lazy } from 'react'

import { iconExperiment } from '../../ui/icons'
import { NavItemEntry } from '../index'

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
