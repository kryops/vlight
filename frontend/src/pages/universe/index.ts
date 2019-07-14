import { lazy } from 'react'

import { iconSun } from '../../ui/icons'
import { NavItemEntry } from '../index'

export const UniversePage = lazy(() =>
  import(/* webpackChunkName: "universe" */ './universe-page')
)

export const universePageRoute = '/universe'

export const universePageNavItem: NavItemEntry = {
  route: universePageRoute,
  icon: iconSun,
  label: 'Universe',
  page: UniversePage,
}
