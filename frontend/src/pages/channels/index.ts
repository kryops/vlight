import { lazy } from 'react'

import { iconFader } from '../../ui/icons'
import { NavItemEntry } from '../index'

export const ChannelsPage = lazy(() =>
  import(/* webpackChunkName: "channels" */ './channels-page')
)

export const channelsPageRoute = '/channels'

export const channelsPageNavItem: NavItemEntry = {
  route: channelsPageRoute,
  icon: iconFader,
  label: 'Channels',
  page: ChannelsPage,
}
