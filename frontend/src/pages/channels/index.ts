import { iconFader } from '../../ui/icons'
import { NavItemEntry } from '../index'
import { channelsPageRoute } from '../routes'

import ChannelsPage from './channels-page'

export const channelsPageNavItem: NavItemEntry = {
  route: channelsPageRoute,
  icon: iconFader,
  label: 'Channels',
  page: ChannelsPage,
}
