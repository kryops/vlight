import { lazy } from 'react'

import { NavItemEntry } from '..'

import { iconSun } from '../../ui/icons'

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
