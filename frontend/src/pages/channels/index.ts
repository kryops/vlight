import { iconFader } from '../../ui/icons'
import { NavItemEntry } from '../index'

import ChannelsPage from './channels-page'

export const channelsPageRoute = '/channels'

export const channelsPageNavItem: NavItemEntry = {
  route: channelsPageRoute,
  icon: iconFader,
  label: 'Channels',
  page: ChannelsPage,
}
