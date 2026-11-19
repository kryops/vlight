import { apiState } from '../../api/api-state'
import { getUniverseIndex } from '../../api/util'
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
  useApiStateSelector<number[] | undefined>(
    currentApiState =>
      currentApiState.channels?.slice(
        getUniverseIndex(from),
        getUniverseIndex(to) + 1
      ),
    { event: 'channels' }
  )

  return (
    <StatelessChannelsWidget
      channels={apiState.channels!}
      from={from}
      to={to}
      title={title}
    />
  )
}
