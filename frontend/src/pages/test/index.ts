import { iconExperiment } from '../../ui/icons'
import { NavItemEntry } from '../index'

import TestPage from './test-page'

export const testPageRoute = '/test'

export const testPageNavItem: NavItemEntry = {
  route: testPageRoute,
  icon: iconExperiment,
  label: 'Test',
  page: TestPage,
}
