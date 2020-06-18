import { iconExperiment } from '../../ui/icons'
import { NavItemEntry } from '../index'
import { testPageRoute } from '../routes'

import TestPage from './test-page'

export const testPageNavItem: NavItemEntry = {
  route: testPageRoute,
  icon: iconExperiment,
  label: 'Test',
  page: TestPage,
}
