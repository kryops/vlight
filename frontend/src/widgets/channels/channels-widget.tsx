import { isChannelRangeEqual } from '../../api/util'
import { useApiStateSelector } from '../../hooks/api'

import { StatelessChannelsWidget } from './stateless-channels-widget'

export interface ChannelsWidgetProps {
  from: number
  to: number
  title?: string
}

/**
 * Widget to display DMX channel faders.
 */
export const ChannelsWidget = ({ from, to, title }: ChannelsWidgetProps) => {
  // only re-render if the displayed channels change
  const channels = useApiStateSelector(
    currentApiState => currentApiState.channels,
    {
      event: 'channels',
      isEqual: (a, b) => isChannelRangeEqual(a, b, from, to),
    }
  )

  return (
    <StatelessChannelsWidget
      channels={channels!}
      from={from}
      to={to}
      title={title}
    />
  )
}
