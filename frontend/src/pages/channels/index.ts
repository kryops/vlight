import { iconFader } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { channelsPageRoute } from '../routes'

import ChannelsPage from './channels-page'

export const channelsPageNavItem: NavItemEntry = {
  route: channelsPageRoute,
  icon: iconFader,
  label: 'Channels',
  page: ChannelsPage,
  highlighted: apiState =>
    apiState.channels?.some(value => value !== 0) ?? false,
}
