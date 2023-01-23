import { iconFader } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { channelsPageRoute } from '../routes'

import ChannelsPage from './channels-page'
import { isAnyChannelOn } from './channels-actions'

export const channelsPageNavItem: NavItemEntry = {
  route: channelsPageRoute,
  icon: iconFader,
  label: 'Channels',
  page: ChannelsPage,
  highlighted: isAnyChannelOn,
}
